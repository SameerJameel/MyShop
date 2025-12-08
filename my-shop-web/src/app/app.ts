import { Component , signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopMenu } from './shared/top-menu/top-menu'; // عدّل المسار حسب اسم الملف


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopMenu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-shop-web');
}




