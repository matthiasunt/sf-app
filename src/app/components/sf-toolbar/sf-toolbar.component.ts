import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sf-toolbar',
  templateUrl: './sf-toolbar.component.html',
  styleUrls: ['./sf-toolbar.component.scss'],
})
export class SfToolbarComponent {
  constructor(private router: Router) {}

  toSettings() {
    this.router.navigate(['/settings']);
  }
}
