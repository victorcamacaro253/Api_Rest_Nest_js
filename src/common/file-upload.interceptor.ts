import { Injectable } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class FileUploadInterceptor {
  static upload() {
    return FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4() + extname(file.originalname);
          cb(null, uniqueSuffix);
        },
      }),
    });
  }

 static uploadMultiple() {
    return FileInterceptor('files', {
        storage:diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = uuidv4() + extname(file.originalname);
                cb(null, uniqueSuffix);
                },
                }),
        })
    }


  


}