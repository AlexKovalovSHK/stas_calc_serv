import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMongoModel, UserSchema } from './infrastructure/schemas/user.shema';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserMongoModel.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
