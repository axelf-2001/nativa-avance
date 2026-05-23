import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { CartService } from '../services/cart.service';
import { Producto, ProductsService } from '../services/products.service';
import { addIcons } from 'ionicons';
import { 
  personOutline, logOutOutline, receiptOutline, mailOutline, 
  lockClosedOutline, settingsOutline, heartOutline, 
  locationOutline, helpCircleOutline, bagHandleOutline, notificationsOutline,
  cameraOutline, saveOutline, createOutline, checkmarkCircleOutline,
  trashOutline, addCircleOutline
} from 'ionicons/icons';

interface UsuarioNativa {
  nombre: string;
  email: string;
  pass: string;
  avatar?: string;
  role?: 'admin' | 'cliente';
}

const ADMIN_EMAIL = 'admin@nativa.com';
const ADMIN_PASS = 'Admin123';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab3Page implements OnInit {
  estaLogueado = false;
  mostrandoRegistro = false;
  editandoPerfil = false;
  nombre = '';
  email = '';
  pass = '';
  nombreEditado = '';
  avatarPreview = 'assets/profile-placeholder.svg';
  usuarioActivo: UsuarioNativa | null = null;
  historial: any[] = [];
  notificaciones: any[] = [];
  usuariosRegistrados: UsuarioNativa[] = [];
  productosAdmin: Producto[] = [];
  nuevoProducto = {
    nombre: '',
    categoria: 'Tops',
    precio: 0,
    descripcion: '',
    imagen: 'assets/products/product-01.png',
    etiqueta: 'Nuevo',
    color: 'Neutro'
  };
  imagenProductoOriginal: string | null = null;
  escalaImagenProducto = 100;

  constructor(
    private storage: Storage,
    private toastCtrl: ToastController,
    public cartService: CartService,
    private productsService: ProductsService
  ) {
    addIcons({ 
      personOutline, logOutOutline, receiptOutline, mailOutline, 
      lockClosedOutline, settingsOutline, heartOutline, 
      locationOutline, helpCircleOutline, bagHandleOutline, notificationsOutline,
      cameraOutline, saveOutline, createOutline, checkmarkCircleOutline,
      trashOutline, addCircleOutline
    });
  }

  async ngOnInit() {
    await this.storage.create();
    await this.asegurarAdmin();
    const sesion = await this.storage.get('usuario_sesion');
    if (sesion) {
      this.usuarioActivo = sesion;
      this.nombreEditado = sesion.nombre;
      this.avatarPreview = sesion.avatar || 'assets/profile-placeholder.svg';
      this.estaLogueado = true;
      await this.cargarDatos();
      await this.cargarPanelAdmin();
    }
  }

  async ionViewWillEnter() {
    if (this.estaLogueado) {
      this.historial = await this.cartService.getOrders();
      this.notificaciones = await this.cartService.getNotifications();
      await this.cargarPanelAdmin();
    }
  }

  get esAdmin() {
    return this.usuarioActivo?.role === 'admin';
  }

  async cargarDatos() {
    if (!this.usuarioActivo) return;
    await this.cartService.setUserId(this.usuarioActivo.email);
    this.historial = await this.cartService.getOrders();
    this.notificaciones = await this.cartService.getNotifications();
  }

  async login() {
    if (!this.email || !this.pass) {
      await this.mostrarToast('Ingresa tu email y contraseña.');
      return;
    }

    const usuarios = (await this.storage.get('usuarios_nativa')) || [];
    const user = usuarios.find((u: UsuarioNativa) => u.email.toLowerCase() === this.email.toLowerCase() && u.pass === this.pass);
    if (user) {
      this.usuarioActivo = user;
      this.nombreEditado = user.nombre;
      this.avatarPreview = user.avatar || 'assets/profile-placeholder.svg';
      this.estaLogueado = true;
      await this.storage.set('usuario_sesion', user);
      await this.cargarDatos();
      await this.cargarPanelAdmin();
      this.limpiarFormulario();
      await this.mostrarToast(`Hola, ${user.nombre}.`);
    } else {
      await this.mostrarToast('No encontramos una cuenta con esos datos.');
    }
  }

  async logout() {
    this.estaLogueado = false;
    this.usuarioActivo = null;
    this.editandoPerfil = false;
    this.avatarPreview = 'assets/profile-placeholder.svg';
    this.historial = [];
    this.notificaciones = [];
    await this.storage.remove('usuario_sesion');
    await this.cartService.setUserId('invitado');
    await this.mostrarToast('Sesión cerrada.');
  }

  async registrar() {
    if (!this.nombre || !this.email || !this.pass) {
      await this.mostrarToast('Completa nombre, email y contraseña.');
      return;
    }

    const usuarios: UsuarioNativa[] = (await this.storage.get('usuarios_nativa')) || [];
    const existe = usuarios.some(u => u.email.toLowerCase() === this.email.toLowerCase());
    if (existe) {
      await this.mostrarToast('Ese email ya está registrado.');
      return;
    }

    const nuevoUsuario: UsuarioNativa = {
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      pass: this.pass,
      avatar: 'assets/profile-placeholder.svg',
      role: 'cliente'
    };

    usuarios.push(nuevoUsuario);
    await this.storage.set('usuarios_nativa', usuarios);
    this.usuarioActivo = nuevoUsuario;
    this.nombreEditado = nuevoUsuario.nombre;
    this.avatarPreview = nuevoUsuario.avatar || 'assets/profile-placeholder.svg';
    this.estaLogueado = true;
    await this.storage.set('usuario_sesion', nuevoUsuario);
    await this.cartService.setUserId(nuevoUsuario.email);
    await this.cartService.addNotification('Bienvenida', '¡Gracias por unirte a Nativa!');
    await this.cargarDatos();
    await this.cargarPanelAdmin();
    this.limpiarFormulario();
    await this.mostrarToast('Cuenta creada correctamente.');
  }

  async guardarPerfil() {
    if (!this.usuarioActivo || !this.nombreEditado.trim()) {
      await this.mostrarToast('El nombre no puede estar vacío.');
      return;
    }

    const usuarios: UsuarioNativa[] = (await this.storage.get('usuarios_nativa')) || [];
    const actualizado: UsuarioNativa = {
      ...this.usuarioActivo,
      nombre: this.nombreEditado.trim(),
      avatar: this.avatarPreview
    };
    const index = usuarios.findIndex(u => u.email === actualizado.email);
    if (index >= 0) {
      usuarios[index] = actualizado;
      await this.storage.set('usuarios_nativa', usuarios);
    }

    this.usuarioActivo = actualizado;
    await this.storage.set('usuario_sesion', actualizado);
    await this.cargarPanelAdmin();
    this.editandoPerfil = false;
    await this.mostrarToast('Perfil actualizado.');
  }

  async cambiarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await this.mostrarToast('Selecciona un archivo de imagen.');
      input.value = '';
      return;
    }

    this.avatarPreview = await this.comprimirImagen(file, 420, 420);
    if (this.usuarioActivo) {
      await this.guardarAvatarActual();
    }
    input.value = '';
    await this.mostrarToast('Imagen de perfil guardada.');
  }

  async cambiarImagenProducto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await this.mostrarToast('Selecciona un archivo de imagen.');
      input.value = '';
      return;
    }

    this.imagenProductoOriginal = await this.archivoADataUrl(file);
    this.escalaImagenProducto = 100;
    await this.aplicarAjusteImagenProducto();
    input.value = '';
    await this.mostrarToast('Imagen del producto cargada.');
  }

  async ajustarImagenProducto(event: CustomEvent) {
    this.escalaImagenProducto = Number(event.detail.value);
    await this.aplicarAjusteImagenProducto();
  }

  productosDeOrden(orden: any) {
    return Array.isArray(orden.productos) ? orden.productos : [];
  }

  private archivoADataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private comprimirImagen(file: File, targetWidth: number, targetHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo procesar la imagen.'));
            return;
          }

          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const width = img.width * scale;
          const height = img.height * scale;
          const x = (targetWidth - width) / 2;
          const y = (targetHeight - height) / 2;
          ctx.fillStyle = '#f2ece3';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, x, y, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        img.src = String(reader.result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private aplicarAjusteImagenProducto(): Promise<void> {
    if (!this.imagenProductoOriginal) return Promise.resolve();
    const source = this.imagenProductoOriginal;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const targetWidth = 720;
        const targetHeight = 960;
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo ajustar la imagen.'));
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        const fitScale = Math.min(targetWidth / img.width, targetHeight / img.height);
        const scale = fitScale * (this.escalaImagenProducto / 100);
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (targetWidth - width) / 2;
        const y = (targetHeight - height) / 2;
        ctx.drawImage(img, x, y, width, height);
        this.nuevoProducto.imagen = canvas.toDataURL('image/jpeg', 0.86);
        resolve();
      };
      img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      img.src = source;
    });
  }

  private async guardarAvatarActual() {
    if (!this.usuarioActivo) return;
    const actualizado = {
      ...this.usuarioActivo,
      avatar: this.avatarPreview
    };
    await this.actualizarUsuario(actualizado);
    this.usuarioActivo = actualizado;
  }

  private async actualizarUsuario(usuario: UsuarioNativa) {
    const usuarios: UsuarioNativa[] = (await this.storage.get('usuarios_nativa')) || [];
    const index = usuarios.findIndex(u => u.email === usuario.email);
    if (index >= 0) {
      usuarios[index] = usuario;
      await this.storage.set('usuarios_nativa', usuarios);
    }
    await this.storage.set('usuario_sesion', usuario);
  }

  private async asegurarAdmin() {
    const usuarios: UsuarioNativa[] = (await this.storage.get('usuarios_nativa')) || [];
    const index = usuarios.findIndex(u => u.email.toLowerCase() === ADMIN_EMAIL);
    const admin: UsuarioNativa = {
      nombre: 'Administrador Nativa',
      email: ADMIN_EMAIL,
      pass: ADMIN_PASS,
      avatar: 'assets/profile-placeholder.svg',
      role: 'admin'
    };

    if (index === -1) {
      usuarios.unshift(admin);
    } else {
      usuarios[index] = {
        ...usuarios[index],
        pass: ADMIN_PASS,
        role: 'admin'
      };
    }

    await this.storage.set('usuarios_nativa', usuarios);
  }

  async cargarPanelAdmin() {
    if (!this.esAdmin) return;
    this.usuariosRegistrados = (await this.storage.get('usuarios_nativa')) || [];
    this.productosAdmin = await this.productsService.getProducts();
  }

  async guardarUsuarioAdmin(usuario: UsuarioNativa) {
    const usuarios: UsuarioNativa[] = (await this.storage.get('usuarios_nativa')) || [];
    const index = usuarios.findIndex(u => u.email === usuario.email);
    if (index >= 0) {
      usuarios[index] = usuario;
      await this.storage.set('usuarios_nativa', usuarios);
      if (this.usuarioActivo?.email === usuario.email) {
        this.usuarioActivo = usuario;
        this.nombreEditado = usuario.nombre;
        this.avatarPreview = usuario.avatar || 'assets/profile-placeholder.svg';
        await this.storage.set('usuario_sesion', usuario);
      }
      await this.mostrarToast('Usuario actualizado.');
    }
  }

  async eliminarUsuarioAdmin(usuario: UsuarioNativa) {
    if (usuario.email === this.usuarioActivo?.email) {
      await this.mostrarToast('No puedes eliminar tu propia cuenta admin.');
      return;
    }
    const usuarios: UsuarioNativa[] = (await this.storage.get('usuarios_nativa')) || [];
    await this.storage.set('usuarios_nativa', usuarios.filter(u => u.email !== usuario.email));
    await this.cargarPanelAdmin();
    await this.mostrarToast('Usuario eliminado.');
  }

  async agregarProductoAdmin() {
    if (!this.nuevoProducto.nombre || !this.nuevoProducto.categoria || this.nuevoProducto.precio <= 0) {
      await this.mostrarToast('Completa nombre, categoría y precio del producto.');
      return;
    }

    await this.productsService.addProduct({
      nombre: this.nuevoProducto.nombre.trim(),
      categoria: this.nuevoProducto.categoria.trim(),
      precio: Number(this.nuevoProducto.precio),
      descripcion: this.nuevoProducto.descripcion.trim() || 'Producto agregado desde el panel de administración.',
      imagen: this.nuevoProducto.imagen.trim() || 'assets/image-placeholder.svg',
      etiqueta: this.nuevoProducto.etiqueta.trim() || 'Nuevo',
      color: this.nuevoProducto.color.trim() || 'Neutro'
    });
    this.nuevoProducto = {
      nombre: '',
      categoria: 'Tops',
      precio: 0,
      descripcion: '',
      imagen: 'assets/products/product-01.png',
      etiqueta: 'Nuevo',
      color: 'Neutro'
    };
    this.imagenProductoOriginal = null;
    this.escalaImagenProducto = 100;
    await this.cargarPanelAdmin();
    await this.mostrarToast('Producto agregado.');
  }

  async eliminarProductoAdmin(producto: Producto) {
    await this.productsService.deleteProduct(producto.id);
    await this.cargarPanelAdmin();
    await this.mostrarToast('Producto eliminado.');
  }

  private limpiarFormulario() {
    this.nombre = '';
    this.email = '';
    this.pass = '';
    this.mostrandoRegistro = false;
  }

  private async mostrarToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1800,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }
}
