import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';
import geolib from 'geolib';

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
  retrieved_images: string[]=[];
  all_locations: any;
  today: string = new Date().toISOString(); // minimum date = current date
  startDate: string = new Date().toISOString();
  min_end_date: string = this.startDate;
  maxDate: string = new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toISOString(); // max date = 3 months from today

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.get_all_locations().then(()=>{
      console.log("Locations loaded");        
    });
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

  getlocation(){
    let me = this;
    this.getlocation_wrapper().then((resp:any)=>{
      // console.log(typeof this.all_locations[0].point);
      let latitude = resp.coords.latitude;
      let longitude = resp.coords.longitude;
      let result: any;
      result = geolib.findNearest({ latitude: latitude, longitude: longitude }, this.all_locations);
      console.log("Closest to:");        
      console.log(this.all_locations[result.key]);
      let current_time = new Date();
      let current_location =  (this.all_locations[result.key]).value;
      firebase.firestore().collection('file_data').where('location','==',current_location).get().then(function(result){
        let value = result.docs.map ((doc) => { return {data:doc.data(), id:doc.id} });
        // console.log("values:");
        value = value.filter((val)=>{        
          return (new Date(val.data.startDate) < current_time) && (current_time < new Date(val.data.endDate) );
        })
        value.forEach((val:any) => {
          // console.log(val.id);        
          // console.log(val.data.location);
          // console.log(val.data.startDate);
          // console.log(val.data.endDate);
          me.retrieved_images.push(val.data.image_url);        
          // me.download(val.id);
          
        })
  
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

  

}
