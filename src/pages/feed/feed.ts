import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import firebase from 'firebase';
import moment, { duration } from 'moment';
import { isDifferent } from '@angular/core/src/render3/util';
import { LoginPage } from '../login/login';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';



@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {
  text: string="";
  posts: any[]=[];
  pageSize: number= 10;
  cursor: any;//documentSnapshot- holds value of pageSizeth post
  infiniteEvent: any;
  image: string; 
  startDate: string;
  endDate: string;
  location:number;
  today: string = new Date().toISOString(); // minimum date = current date
  maxDate: string = new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toISOString(); // max date = 3 months from today
  
  constructor(public navCtrl: NavController, public navParams: NavParams,public loadingCtrl: LoadingController, 
    public toastCtrl: ToastController, private camera: Camera, private imagePicker: ImagePicker) {
  }

 

  post()
  {
    console.log(this.location);
    
    firebase.firestore().collection("file_data").add({
      file_name: this.text,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: firebase.auth().currentUser.uid,
      owner_name: firebase.auth().currentUser.displayName,
      location: this.location,
      startDate: this.startDate,
      endDate: this.endDate
    }).then((doc) => {
      console.log(doc);
      this.upload(doc.id)

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
        message: "You have been Logged Out",
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
    targetHeight: 512,
    targetWidth: 512,
    allowEdit: true,
    // sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  }
  this.camera.getPicture(options).then((base64Image)=>{
    this.image = "data:image/png;base64," + base64Image;
    // console.log(base64Image)
  }).catch((err)=>{console.log(err)})
}

upload(name: string){
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
    })
    
  })
}

}
