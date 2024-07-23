import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
  AWS_S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  AWS_REGION = this.configService.get('AWS_REGION');
  AWS_ACCESS_KEY_ID = this.configService.get('AWS_ACCESS_KEY_ID');
  AWS_SECRET_ACCESS_KEY = this.configService.get('AWS_SECRET_ACCESS_KEY');

  private logger = new Logger();

  constructor(private configService: ConfigService) {}

  public async uploadArquivo(file: Express.Multer.File, id: string) {
    const s3 = new AWS.S3({
      region: this.AWS_REGION,
      credentials: {
        accessKeyId: this.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
      },
    });

    const fileExtension = file.originalname.split('.').at(-1);
    const urlKey = `${id}.${fileExtension}`;
    this.logger.log(`UploadArquivo urlKey: ${urlKey}`);

    const params: AWS.S3.PutObjectRequest = {
      Body: file.buffer,
      Bucket: this.AWS_S3_BUCKET_NAME,
      Key: urlKey,
    };

    const data = s3
      .putObject(params)
      .promise()
      .then(
        () => {
          return {
            url: `https://${this.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${urlKey}`,
          };
        },
        (err) => {
          this.logger.error(err);
          return err;
        },
      );

    return data;
  }
}
