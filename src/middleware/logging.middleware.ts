import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now(); // Marca de tiempo al inicio de la solicitud

    res.on('finish', () => {
      const duration = Date.now() - start; // Calcula la duración en milisegundos
      console.log(
        `[${req.method}] ${req.url} - ${res.statusCode} - ${duration}ms`,
      );
    });

    next(); // Continúa con el siguiente middleware o controlador
  }
}