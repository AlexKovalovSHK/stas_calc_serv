import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { pdfBody } from './documents';
import * as fs from 'fs';
import * as stream from 'stream';
import { S3 } from 'aws-sdk';
import { NewRechnungDto } from './rechnung/dto/new-rechnung.dto';
import { RechnungDto } from './rechnung/dto/rechnung-resp.dto';
const pdf = require('html-pdf');

@Controller('/api')
export class AppController {
 
  
}
