import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';
import geolib from 'geolib';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

// import { Geolocation } from '@ionic-native/geolocation'; // geolocation


/**
 * Generated class for the ReceiverPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-receiver',
  templateUrl: 'receiver.html',
})
export class ReceiverPage {
  retrieved_images: string[] = [];
  TIMEOUT_INTERVAL:number = 1000 * 10 ;
  all_locations: any;
  today: string = new Date().toISOString(); // minimum date = current date
  startDate: string = new Date().toISOString();
  min_end_date: string = this.startDate;
  maxDate: string = new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toISOString(); // max date = 3 months from today

  constructor(public navCtrl: NavController, public navParams: NavParams, private screenOrientation: ScreenOrientation) {
    this.get_all_locations().then(()=>{
      console.log("Locations loaded");
      this.subscribe_location();
    });
    // this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }

    // Set up all locations from DB
    async get_all_locations(){
      const snapshot = await firebase.firestore().collection('locations').get()
      let value = snapshot.docs.map(doc => doc.data());
      value.forEach((val) => {
        val.latitude = val.point.latitude;
        val.longitude = val.point.longitude;
      });
      this.all_locations = value;
      console.log(this.all_locations);
      
   }
  
   

  // ionViewDidLoad() {
  //   console.log('ionViewDidLoad ReceiverPage');
  // }

  getlocation_wrapper(){
    let options = {
      enableHighAccuracy: true,
    timeout: 5000,
      maximumAge: 0
    };
    return new Promise((res,rej) => {
      navigator.geolocation.getCurrentPosition(res,rej,options);
    });
  }


  // TODO - Receive permission

  getlocation(){
    let me = this;
    console.log("here 0");
    
    this.getlocation_wrapper().then((resp:any)=>{
      // console.log(typeof this.all_locations[0].point);
      let latitude = resp.coords.latitude;
      let longitude = resp.coords.longitude;
      let result: any;
      result = geolib.findNearest({ latitude: latitude, longitude: longitude }, this.all_locations);
      console.log("Closest to:");        
      console.log(this.all_locations[result.key]);
      console.log("here 1")
      let current_time = new Date();
      let current_location =  (this.all_locations[result.key]).value;
      firebase.firestore().collection('file_data').where('location', '==', current_location).get().then(function (result) {
        console.log("here 2")
        let value = result.docs.map((doc) => { return { data: doc.data(), id: doc.id } });
        console.log("here 3")
        // console.log("values:");
        value = value.filter((val)=>{        
          return (new Date(val.data.startDate) < current_time) && (current_time < new Date(val.data.endDate) );
        })
        let temp_images = [];
        // me.retrieved_images = [];
        console.log("here 4")
        value.forEach((val:any) => {
          // console.log(val.id);        
          // console.log(val.data.location);
          // console.log(val.data.startDate);
          console.log(val.data.image_url);
          temp_images.push(val.data.image_url);        
          // me.download(val.id);
          
        })
        me.retrieved_images = temp_images;
  
        // me.slideshow()
        
      })
      // let value = snapshot.docs.map(doc => doc.data());
      // value.forEach((val) => {
      //   val.latitude = val.point.latitude;
      //   val.longitude = val.point.longitude;
      // });
      // this.all_locations = value;
      
    })   
  }

  subscribe_location() {
    this.getlocation();
    setInterval(() => {
      this.getlocation()
    }, this.TIMEOUT_INTERVAL);
  }

  

}
