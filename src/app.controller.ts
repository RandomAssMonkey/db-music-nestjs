import { Body, Controller, Get, Param, Post, Render, Res} from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { newSongDTO } from './newSong.dto';
import e, { Response } from 'express';
import { MESSAGES } from '@nestjs/core/constants';
import { deleteSongDTO } from './deleteSong.dto';
import { modifySongDTO } from './modifySong.dto';

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'database',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index() {
    const [ adatok ] = await conn.execute('SELECT id, title, artist, length FROM songs ORDER BY title');
    console.log(adatok);

    return {
       //messages: "",
       songs: adatok,
       
      };
  }

  @Get('/songForm')
  @Render('songForm')
  songForm(){
    return {messages: ""};
  }

  @Post('/songForm')
  @Render('songForm')
  async newSong(@Body() newSong: newSongDTO, @Res() res: Response) {
    const title = newSong.title;
    const artist = newSong.artist;
    const length = newSong.length;
    if(title == "" || artist == "" || length == "") {
      return { messages: "Minden mezőt kötelező kitölteni!"};
    } else if (parseInt(length) < 0){
      return { messages: "A hossz nem lehet negatív!"};
    } else {
      const [ adatok ] = await conn.execute('INSERT INTO songs (artist, title, length) VALUES (?, ?, ?)', [ 
        title,
        artist,
        length,
      ],
      );
      res.redirect('/');
    }
  }

  @Post('/deleteSong')
  //@Render('index')
  async deleteSong(@Body() deleteId: deleteSongDTO, @Res() res: Response){
    const songId = deleteId.id
    const [ adatok ] = await conn.execute('DELETE FROM songs WHERE id = ?', [songId]) as any[];
    console.log(adatok);
    const affectedRows = (adatok.affectedrows);
    console.log(affectedRows);
    /*if(affectedRows != 1){
      //return {messages: "A törlés sikertelen!"}
    }
    else{*/
      console.log("Módosítottt sorok száma:" + affectedRows);
      //return {messages: "Sikeres Törlés!"}
      res.redirect('/');
    //}
  }

  @Get('/modifyForm/:id')
  @Render('modifyForm')
  async modifySongForm(@Param("id") id: number){
    const [ adatok ] = await conn.execute('SELECT id, title, artist, length FROM songs WHERE id = ?', [id]);
    console.log();    
    return {adatok, messages:""};
  }

  @Post('/modifySongForm')
  @Render('modifyForm')
  async modifySong(@Body() modify: modifySongDTO, @Res() res: Response){
    const id = modify.id;
    const title = modify.title;
    const artist = modify.artist;
    const length = modify.length;
    if(title == "" || artist == "" || length == "") {
      return { messages: "Minden mezőt kötelező kitölteni!"};
    } else if (parseInt(length) < 0){
      return { messages: "A hossz nem lehet negatív!"};
    } else {
      const [ adatok ] = await conn.execute('UPDATE songs SET title = ?, artist = ?, length = ? WHERE id = ?', [ 
        title,
        artist,
        length,
        id,
      ]
      ) as any[];
      const affectedRows = adatok.affectedRows
      if(affectedRows != 1){
        return {messages: "Hibás módosítás"}
      }
      else{
        res.redirect('/');
        return {messages: ""}
      }
    }
  }
}
