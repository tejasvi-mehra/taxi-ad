import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import firebase from 'firebase';
import moment, { duration } from 'moment';
import { isDifferent } from '@angular/core/src/render3/util';
import { LoginPage } from '../login/login';
import { ReceiverPage } from '../receiver/receiver'
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { Geolocation } from '@ionic-native/geolocation';
import geolib from 'geolib';
import { resolve } from 'url';
import { log } from 'util';
import { P } from '@angular/core/src/render3';
import { SlideshowComponent } from 'ng-simple-slideshow/src/app/modules/slideshow/slideshow.component';
// import {cors} from 'cors';

// const cors = require('cors')({origin: true});

@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {
  // cors = cors({origin: true});
  text: string="";
  posts: any[]=[];
  pageSize: number= 10;
  cursor: any;//documentSnapshot- holds value of pageSizeth post
  infiniteEvent: any;
  image: string; 
  retrieved_images: string[]=[];
  retrieved_image: string;
  all_locations: any;
  endDate: string;
  location:number;
  today: string = new Date().toISOString(); // minimum date = current date
  startDate: string = new Date().toISOString();
  min_end_date: string = this.startDate;
  maxDate: string = new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toISOString(); // max date = 3 months from today
  
  constructor(public navCtrl: NavController, public navParams: NavParams,public loadingCtrl: LoadingController, 
    public toastCtrl: ToastController, private camera: Camera, private imagePicker: ImagePicker, private geolocation: Geolocation) {
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

  post()
  {
    console.log(this.location);
    
    firebase.firestore().collection("file_data").add({
      // file_name: this.text,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: firebase.auth().currentUser.uid,
      owner_name: firebase.auth().currentUser.displayName,
      location: this.location,
      startDate: this.startDate,
      endDate: this.endDate
    }).then(async (doc) => {
      console.log(doc);
      await this.upload_new(doc.id)

      this.text="";
      this.location=null;
      this.image="";
      this.startDate="";
      this.endDate="";  

      let toast= this.toastCtrl.create({
        message: "Your image has been uploaded",
        duration: 3000
      }).present();
     
      
      })
  }

  logout(){

    firebase.auth().signOut().then(()=>{
      this.toastCtrl.create({
        message: "You have been logged out",
        duration: 3000
      }).present()
      this.navCtrl.setRoot(LoginPage);
    });

  }

  
  addPhoto(){
    this.launchCamera();
    // this.launchGallery();
  }

  launchGallery(){
    let options ={
      maximumImagesCount: 1,
      quality: 100,
      width: 512,
      height: 512,
      outputType: 1 // Base64
    }
    this.imagePicker.getPictures(options).then(function (results){
        this.image = "data:image/png;base64," + results[0];
  }, (err) => { console.log('Error') });
  }

launchCamera(){
  let options: CameraOptions = {
    quality: 100,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.PNG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
      // targetHeight: 1080,
      // targetWidth: 2220,
    // allowEdit: true,
    // sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  }
  this.camera.getPicture(options).then((base64Image)=>{
    this.image = "data:image/png;base64," + base64Image;
    // console.log(base64Image)
  }).catch((err)=>{console.log(err)})
}

// OLD UPLOAD FUNCTION NOT SAVING URL IN DB
// upload(name: string){
//   let ref = firebase.storage().ref("postImages/" + name);
//   let uploadTask = ref.putString(this.image.split(',')[1], "base64");
//   uploadTask.on("state_changed", function(taskSnapshot){
//     console.log(taskSnapshot);
//   }, function(err){
//     console.log(err);
//   }, function(){
//     console.log("Upload Complete");
//     uploadTask.snapshot.ref.getDownloadURL().then(function(url){
//       console.log(url);  
//     })
    
//   })
// }

upload_new(name: string){
  return new Promise((resolve, reject) => {
  
    let ref = firebase.storage().ref("postImages/" + name);
    let uploadTask = ref.putString(this.image.split(',')[1], "base64");

    uploadTask.on("state_changed", function(taskSnapshot){
      console.log(taskSnapshot);
    }, function(err){
      console.log(err);
    }, function(){
      console.log("Upload Complete");
      uploadTask.snapshot.ref.getDownloadURL().then(function(url){
        console.log(url);  
        firebase.firestore().collection("file_data").doc(name).update({
          image_url: url
        }).then(()=>{
          resolve()
        }).catch((err)=>{
          reject
        })
      }).catch((err)=>{
        reject
      })
      
    })
  })
}

// DOWNLOAD FUNCTION TO GET FILES - NOT NEEDED
// download(name: string){
//   console.log("download");
//   let me = this;
//   let ref = firebase.storage().ref("postImages/" + name);
//   ref.getDownloadURL().then(function(url){
//     // console.log(url);
//     var xhr = new XMLHttpRequest();
//     xhr.responseType = 'blob';
//     xhr.onload = function(event) {
//       var blob = xhr.response;
//     };
//     xhr.open('GET', url);
//     xhr.send();
//     // console.log("URL");
    
//     // console.log(url);
    
//     me.retrieved_images.push(url);
//     // console.log(me.retrieved_images);
//     // me.retrieved_images = url

    
//     // Or inserted into an <img> element:
//     // var img = document.getElementById('retrieved_images');
//     // img.src = url;

//   }).catch(function(error) {
//     // Handle any errors
//   });  

// }

// Get current position in promise

// getlocation_wrapper(){
//   let options = {
//     enableHighAccuracy: true,
//   timeout: 5000,
//     maximumAge: 0
//   };
//   return new Promise((res,rej) => {
//     navigator.geolocation.getCurrentPosition(res,rej,options);
//   });
// }

// slideshow(){
//   for(let i=0;i<this.retrieved_images.length;i++){
//     setTimeout()
//   }
// }


go_to_receiver(){
  this.navCtrl.push(ReceiverPage);
      // Test cases
      // let ktown_lat = 22.2812;
      // let ktown_lon = 114.1289;
      // let hku_lat = 22.284;
      // let hku_lon = 114.135;
      // let hku_lat: number = 22.2830;
      // let hku_lon = 114.1371;
  // let me = this;
  // this.getlocation_wrapper().then((resp:any)=>{
  //   // console.log(typeof this.all_locations[0].point);
  //   let latitude = resp.coords.latitude;
  //   let longitude = resp.coords.longitude;
  //   let result: any;
  //   result = geolib.findNearest({ latitude: latitude, longitude: longitude }, this.all_locations);
  //   console.log("Closest to:");        
  //   console.log(this.all_locations[result.key]);
  //   let current_time = new Date();
  //   let current_location =  (this.all_locations[result.key]).value;
  //   firebase.firestore().collection('file_data').where('location','==',current_location).get().then(function(result){
  //     let value = result.docs.map ((doc) => { return {data:doc.data(), id:doc.id} });
  //     console.log("values:");
  //     value = value.filter((val)=>{        
  //       return (new Date(val.data.startDate) < current_time) && (current_time < new Date(val.data.endDate) );
  //     })
  //     value.forEach((val:any) => {
  //       console.log(val.id);        
  //       console.log(val.data.location);
  //       console.log(val.data.startDate);
  //       console.log(val.data.endDate);
  //       me.retrieved_images.push(val.data.image_url);        
  //       // me.download(val.id);
        
  //     })

  //     // me.slideshow()
      
  //   })
  //   // let value = snapshot.docs.map(doc => doc.data());
  //   // value.forEach((val) => {
  //   //   val.latitude = val.point.latitude;
  //   //   val.longitude = val.point.longitude;
  //   // });
  //   // this.all_locations = value;
    
  // })  
}

// async get_cabbie(){
//   const location = await this.getlocation_wrapper();
//   let latitude = resp.coords.latitude;
//   let longitude = resp.coords.longitude;
//   const result = await geolib.findNearest
//   console.log(location);
//   return location;
// }

// cabbie(){
//   this.get_cabbie();
  
// }

// Calculate closest distance (not needed if using geolib)
// calcCrow(lat1:number, lon1:number, lat2:number, lon2:number) 
// {
//   let R = 6371; // km
//   let dLat = this.toRad(lat2-lat1);
//   let dLon = this.toRad(lon2-lon1);
//   let lat1_radians = this.toRad(lat1);
//   let lat2_radians = this.toRad(lat2);

//   var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1_radians) * Math.cos(lat2_radians); 
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
//   var d = R * c;
//   return d;
// }

// // Converts numeric degrees to radians
// toRad(Value:number) 
// {
//     return Value * Math.PI / 180;
// }

}
