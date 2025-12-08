import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-menu',
  standalone: true, 
  imports: [CommonModule, RouterModule], 
  templateUrl: './top-menu.html',
  styleUrls: ['./top-menu.scss']
})
export class TopMenu { 


  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

}
