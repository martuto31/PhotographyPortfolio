import { Component, Input, OnInit } from '@angular/core';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, S3ClientConfig, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

import awsCredentials from './../../../assets/aws-credentials.json';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  standalone: true,
})

export class GalleryComponent implements OnInit {

  @Input() galleryName: string = 'Други';

  public imageUrls: string[] = [];
  public imagesLoaded = false;

  private bucketName = 'phbyviki';

  async ngOnInit(): Promise<void> {
    await this.loadImages();

    this.setImageOrientation();
  }

  private async loadImages(): Promise<void> {
    const s3 = this.getS3Client();

    if (this.galleryName === 'Personal') {
      this.galleryName = 'Personal/Други'; // TODO: Remove when more personal galleries are added
    }

    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: this.galleryName,
    });

    const response = await s3.send(command);

    for (const image of response.Contents!) {
      const getImageCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: image.Key,
      });

      const url = await getSignedUrl(s3, getImageCommand, { expiresIn: 7200 });
      
      this.imageUrls.push(url);
    }

    this.imageUrls.shift();
  }

  private setImageOrientation(): void {
    document.querySelectorAll('.image').forEach((img) => {
      const imageElement = img as HTMLImageElement;
      
      imageElement.onload = () => {
        if (imageElement.naturalWidth > imageElement.naturalHeight) {
          imageElement.classList.add('landscape');
        } else {
          imageElement.classList.add('portrait');
        }
      };
    });
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
