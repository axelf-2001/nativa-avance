import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  bagAddOutline, notificationsOutline, searchOutline, closeOutline, 
  star, shirtOutline, heartOutline
} from 'ionicons/icons';
import { CartService } from '../services/cart.service';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  imagen: string;
  etiqueta: string;
  color: string;
}

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
  
  // Filtros
  textoBusqueda: string = '';
  categoriaSeleccionada: string = 'Todos';
  
  // Datos de selección
  productoSeleccionado: Producto | null = null;
  tallaSeleccionada: string = 'S';

  categorias = ['Todos', 'Tops', 'Pantalones', 'Vestidos', 'Chaquetas'];

  productos: Producto[] = [
    { id: 1, nombre: 'Top Corto Nativa', categoria: 'Tops', precio: 15.99, etiqueta: 'Nuevo', color: 'Ivory', descripcion: 'Top versátil de algodón orgánico premium.', imagen: 'assets/products/product-01.png' },
    { id: 2, nombre: 'Pantalón High Waist', categoria: 'Pantalones', precio: 29.50, etiqueta: 'Básico', color: 'Arena', descripcion: 'Corte elegante que estiliza la figura.', imagen: 'assets/products/product-02.png' },
    { id: 3, nombre: 'Vestido Verano', categoria: 'Vestidos', precio: 42.00, etiqueta: 'Ligero', color: 'Arcilla', descripcion: 'Vestido ligero ideal para días de sol.', imagen: 'assets/products/product-03.png' },
    { id: 4, nombre: 'Chaqueta Denim', categoria: 'Chaquetas', precio: 55.00, etiqueta: 'Favorito', color: 'Denim', descripcion: 'Chaqueta clásica de mezclilla duradera.', imagen: 'assets/products/product-04.png' },
    { id: 5, nombre: 'Top Seda Negro', categoria: 'Tops', precio: 22.00, etiqueta: 'Noche', color: 'Negro', descripcion: 'Elegancia y frescura en una sola prenda.', imagen: 'assets/products/product-05.png' },
    { id: 6, nombre: 'Camisa Lino Relax', categoria: 'Tops', precio: 34.00, etiqueta: 'Natural', color: 'Lino', descripcion: 'Camisa transpirable con textura suave y caída relajada.', imagen: 'assets/products/product-06.png' },
    { id: 7, nombre: 'Falda Midi Terra', categoria: 'Vestidos', precio: 38.50, etiqueta: 'Comfy', color: 'Terracota', descripcion: 'Silueta midi cómoda para looks casuales o pulidos.', imagen: 'assets/products/product-07.png' },
    { id: 8, nombre: 'Blazer Oversize', categoria: 'Chaquetas', precio: 68.00, etiqueta: 'Premium', color: 'Carbón', descripcion: 'Blazer estructurado con fit amplio y acabado sofisticado.', imagen: 'assets/products/product-08.png' },
    { id: 9, nombre: 'Suéter Knit Soft', categoria: 'Tops', precio: 45.00, etiqueta: 'Suave', color: 'Avena', descripcion: 'Punto ligero y abrigador para capas de media estación.', imagen: 'assets/products/product-09.png' },
    { id: 10, nombre: 'Jean Wide Leg', categoria: 'Pantalones', precio: 49.90, etiqueta: 'Trend', color: 'Azul', descripcion: 'Denim de pierna amplia con talle alto y caída moderna.', imagen: 'assets/products/product-10.png' },
    { id: 11, nombre: 'Blusa Satin Sage', categoria: 'Tops', precio: 31.00, etiqueta: 'Satin', color: 'Sage', descripcion: 'Blusa satinada de textura fluida para combinar fácil.', imagen: 'assets/products/product-11.png' },
    { id: 12, nombre: 'Jumpsuit Diario', categoria: 'Vestidos', precio: 59.00, etiqueta: 'Todo en uno', color: 'Taupe', descripcion: 'Enterizo cómodo con líneas limpias para uso diario.', imagen: 'assets/products/product-12.png' }
  ];

  productosFiltrados = [...this.productos];

  constructor(public cartService: CartService) {
    addIcons({ bagAddOutline, notificationsOutline, searchOutline, closeOutline, star, shirtOutline, heartOutline });
  }

  ngOnInit() {
    // Simulación de carga inicial
    setTimeout(() => {
      this.cargando = false;
    }, 1500);
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

  cerrarDetalle() {
    this.mostrarDetalle = false;
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
}
