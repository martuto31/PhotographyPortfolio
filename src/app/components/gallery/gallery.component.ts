import { Component, Input, OnInit } from '@angular/core';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, S3ClientConfig, ListObjectsV2Command, GetObjectCommand, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';

import { DimensionService } from './../../services/dimension.service';

import awsCredentials from './../../../assets/aws-credentials.json';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  standalone: true,
})

export class GalleryComponent implements OnInit {

  constructor(public dimensionsService: DimensionService) { }

  @Input() galleryName: string = 'Други';

  public initialImageUrls: string[] = [];
  public imageUrls: string[] = [];

  public areImagesLoaded = false;
  public loadedImages: boolean[] = []

  public isModalOpen = false;
  public modalImage = '';

  private s3 = this.getS3Client();
  private bucketName = 'phbyviki';
  private imageList!: ListObjectsV2CommandOutput;

  async ngOnInit(): Promise<void> {
    await this.getImageList();

    this.loadedImages = Array(this.imageList.Contents!.length).fill(false);
    
    await this.loadImages().then(() => {
      setTimeout(() => {
        this.areImagesLoaded = true;
      }, 100);
    });
  }

  public onImageLoad(index: number): void {
    this.loadedImages[index] = true;
  }

  public openModal(imageSrc: string): void {
    if (this.dimensionsService.isMobile) {
      return;
    }
    
    this.modalImage = imageSrc;

    this.isModalOpen = true;
    
    setTimeout(() => {
      this.setImageOrientation();
    });
  }

  public closeModal(): void {
    this.modalImage = '';

    this.isModalOpen = false;
  }

  private async getImageList(): Promise<void> {
    if (this.galleryName === 'Personal') {
      this.galleryName = 'Personal/Други'; // TODO: Remove when more personal galleries are added
    }

    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: this.galleryName,
    });

    const response = await this.s3.send(command);

    this.imageList = response;
  }

  private async loadImages(): Promise<void> {
    if (!this.imageList.Contents) { 
      return;
    }
    
    for (const image of this.imageList.Contents) {
      const getImageCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: image.Key,
      });

      const url = await getSignedUrl(this.s3, getImageCommand, { expiresIn: 7200 });
      
      this.imageUrls.push(url);
    }

    this.imageUrls.shift();
  }

  private setImageOrientation(): void {
    const imageElement = document.getElementById('modal') as HTMLImageElement;

    console.log(imageElement);

    imageElement.onload = () => {
      if (imageElement.naturalWidth > imageElement.naturalHeight) {
        imageElement.classList.add('landscape');
      } else {
        imageElement.classList.add('portrait');
      }
    };
  }

  private getS3Client(): S3Client  {
    const config: S3ClientConfig = {
      region: awsCredentials.region,
      credentials: {
        accessKeyId: awsCredentials.accessKeyId,
        secretAccessKey: awsCredentials.secretAccessKey,
      },
    };

    return new S3Client(config);
  }
}
