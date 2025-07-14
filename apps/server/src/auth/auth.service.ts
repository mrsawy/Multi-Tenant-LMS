import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly organizationService: OrganizationService
  ) { }


  register(registerDto: RegisterDto) {


  }

}
