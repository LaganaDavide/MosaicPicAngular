import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mosaicPics';
  mainImg: any; //Main image selected
  cardImgs = []; //Image selected for the cards 
  public message: string;
  mainImgPixel = []; //average of pixel colour of the rectangles of main image
  cardImgsPixel = []; //average of pixel colour of the cards selected
  cradImgElem = []; //javascript element of the card image
  numRec = 50; // number of rectangle which the main image must been divide
  result = "";
  //select the main image
  preview(files) {
    this.mainImgPixel = []
    if (files.length === 0)
      return;
    
    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }else{
      this.message = "";
    }
 
    var reader = new FileReader();
    reader.readAsDataURL(files[0]); 
    reader.onload = (_event) => { 
      this.mainImg = reader.result; 
    }
  }

  //select the cards immages
  previewMult(files) {
    this.cardImgs = [];
    this.cardImgsPixel = [];
    if (files.length === 0)
      return;
    for (let i = 0 ; i < files.length ; i++){
      let mimeType = files[i].type;
      if (mimeType.match(/image\/*/) == null) {
        this.message = "Only images are supported.";
        return;
      }else{
        this.message = "";
      }
  
      let reader = new FileReader();
      reader.readAsDataURL(files[i]); 
      reader.onload = (_event) => { 
        this.cardImgs.push(reader.result); 
        this.getPixel(this.cardImgs.length -1);
      }
    }
  }

  createMosaic(){ 
    let image = new Image();
    this.mainImgPixel = [];
    image.onload = ()=> {
      let cardwidth = image.width / this.numRec ; 
      let cardHeight = image.height / this.numRec;
      let canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      
      let hidden_ctx = canvas.getContext('2d');
      hidden_ctx.drawImage(image, 0, 0);
      //divide the image in rec section and calculate the average
      for (let i = 0; i < this.numRec; i ++){
        this.mainImgPixel[i] = [];
        for (let j = 0; j < this.numRec; j ++){
          let imageData = hidden_ctx.getImageData(i*cardwidth,j*cardHeight,cardwidth, cardHeight);
          this.mainImgPixel[i][j] = this.averagePixel(imageData);
        };
      };
      //define which card must put in all section
      for (let i = 0 ; i < this.mainImgPixel.length; i ++){
        for (let j = 0 ; j < this.mainImgPixel[i].length; j ++){
          let prossimity = 1000;
          let sel = 0;
          for (let z = 0 ; z < this.cardImgsPixel.length; z ++){
            let temp = 0;
            temp = temp + Math.abs(this.mainImgPixel[i][j].red - this.cardImgsPixel[z].red);
            temp = temp + Math.abs(this.mainImgPixel[i][j].green - this.cardImgsPixel[z].green);
            temp = temp + Math.abs(this.mainImgPixel[i][j].blue - this.cardImgsPixel[z].blue);
            temp = temp + Math.abs(this.mainImgPixel[i][j].alpha - this.cardImgsPixel[z].alpha);
            if (temp < prossimity){
              prossimity = temp;
              sel = z;
            }
          }
          //draw the card image in section
          hidden_ctx.drawImage(this.cradImgElem[sel],i*cardwidth,j*cardHeight,cardwidth, cardHeight);
        }
      }
      //document.body.appendChild(canvas);
      this.result = canvas.toDataURL("image/png");
    };
    image.src = this.mainImg;   
  }

  //calculate pixel average color of cards image and save it in relative array
  getPixel(i) {
    this.cradImgElem[i] = new Image();
    this.cradImgElem[i].onload = ()=> {
        let canvas = document.createElement('canvas');
        canvas.width = this.cradImgElem[i].width;
        canvas.height = this.cradImgElem[i].height;

        let context = canvas.getContext('2d');
        context.drawImage(this.cradImgElem[i], 0, 0);

        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        this.cardImgsPixel[i] = this.averagePixel(imageData) ;
        canvas = null;
    };
    this.cradImgElem[i].src = this.cardImgs[i];
    return;
  }

  averagePixel(imageData){
    let red = 0;
        let green = 0;
        let blue = 0;
        let alpha = 0;
        let num = 0;
        for (let x = 0; x < imageData.width; x++){
          for (let y=0 ; y < imageData.height ; y++){
            let index = (y*imageData.width + x) * 4;
            red += imageData.data[index];
            green += imageData.data[index + 1];
            blue += imageData.data[index + 2];
            alpha += imageData.data[index + 3];
            num ++;
          }
        }                                
        red = Math.round(red /num);
        green = Math.round(green/num);
        blue = Math.round(blue /num);
        alpha = Math.round(alpha/num);
        return { red : red, green : green , blue : blue, alpha : alpha}; 
  }

  test (){
    console.log (this.mainImgPixel);
    console.log (this.cardImgsPixel);
  }
}


