import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  bagAddOutline, notificationsOutline, searchOutline, closeOutline, 
  star, shirtOutline, heartOutline
} from 'ionicons/icons';
import { CartService } from '../services/cart.service';
import { Producto, ProductsService } from '../services/products.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class Tab1Page implements OnInit {
  
  // Estados de la interfaz
  cargando: boolean = true;
  mostrarDetalle: boolean = false;
  mostrarNotificaciones: boolean = false;
  
  // Filtros
  textoBusqueda: string = '';
  categoriaSeleccionada: string = 'Todos';
  
  // Datos de selección
  productoSeleccionado: Producto | null = null;
  tallaSeleccionada: string = 'S';

  categorias = ['Todos'];

  productos: Producto[] = [];

  productosFiltrados = [...this.productos];
  notificaciones: any[] = [];

  constructor(
    public cartService: CartService,
    private productsService: ProductsService,
    private router: Router,
    private modalCtrl: ModalController
  ) {
    addIcons({ bagAddOutline, notificationsOutline, searchOutline, closeOutline, star, shirtOutline, heartOutline });
  }

  async ngOnInit() {
    await this.cargarProductos();
    setTimeout(() => {
      this.cargando = false;
    }, 600);
  }

  async ionViewWillEnter() {
    await this.cargarProductos();
    await this.cargarNotificaciones();
  }

  async ionViewWillLeave() {
    await this.cerrarNotificaciones();
    await this.cerrarDetalle();
  }

  async cargarProductos() {
    this.productos = await this.productsService.getProducts();
    this.categorias = ['Todos', ...Array.from(new Set(this.productos.map(p => p.categoria)))];
    if (!this.categorias.includes(this.categoriaSeleccionada)) {
      this.categoriaSeleccionada = 'Todos';
    }
    this.filtrar();
  }

  async cargarNotificaciones() {
    this.notificaciones = await this.cartService.getNotifications();
  }

  filtrar() {
    this.productosFiltrados = this.productos.filter(p => {
      const coincideTexto = p.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      const coincideCategoria = this.categoriaSeleccionada === 'Todos' || p.categoria === this.categoriaSeleccionada;
      return coincideTexto && coincideCategoria;
    });
  }

  seleccionarCategoria(cat: string) {
    this.categoriaSeleccionada = cat;
    this.filtrar();
  }

  verDetalle(p: Producto) {
    this.productoSeleccionado = p;
    this.tallaSeleccionada = 'S'; // Reset talla al abrir
    this.mostrarDetalle = true;
  }

  async abrirNotificaciones() {
    await this.cargarNotificaciones();
    this.mostrarNotificaciones = true;
  }

  async cerrarNotificaciones() {
    this.mostrarNotificaciones = false;
    await this.modalCtrl.dismiss(null, undefined, 'notifications-modal').catch(() => {});
  }

  async irABolsa() {
    await this.cerrarNotificaciones();
    this.router.navigate(['/tabs/tab2']);
  }

  async cerrarDetalle() {
    this.mostrarDetalle = false;
    await this.modalCtrl.dismiss(null, undefined, 'product-detail-modal').catch(() => {});
  }

  agregarAlCarrito() {
    const pedido = { 
      ...this.productoSeleccionado, 
      talla: this.tallaSeleccionada,
      fecha: new Date().toISOString() 
    };
    this.cartService.addToCart(pedido);
    this.cerrarDetalle();
  }

  usarImagenFallback(event: Event) {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'assets/image-placeholder.svg';
  }

  contarCategoria(cat: string) {
    return cat === 'Todos'
      ? this.productos.length
      : this.productos.filter(p => p.categoria === cat).length;
  }

  get totalAvisosInicio() {
    return this.cartService.cartItems.length + this.notificaciones.length;
  }
}
