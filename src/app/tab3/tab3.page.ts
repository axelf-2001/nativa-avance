import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { CartService } from '../services/cart.service';
import { addIcons } from 'ionicons';
import { 
  personOutline, logOutOutline, receiptOutline, mailOutline, 
  lockClosedOutline, settingsOutline, heartOutline, 
  locationOutline, helpCircleOutline, bagHandleOutline, notificationsOutline,
  cameraOutline, saveOutline, createOutline, checkmarkCircleOutline
} from 'ionicons/icons';

interface UsuarioNativa {
  nombre: string;
  email: string;
  pass: string;
  avatar?: string;
}

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

  constructor(private storage: Storage, private toastCtrl: ToastController, public cartService: CartService) {
    addIcons({ 
      personOutline, logOutOutline, receiptOutline, mailOutline, 
      lockClosedOutline, settingsOutline, heartOutline, 
      locationOutline, helpCircleOutline, bagHandleOutline, notificationsOutline,
      cameraOutline, saveOutline, createOutline, checkmarkCircleOutline
    });
  }

  async ngOnInit() {
    await this.storage.create();
    const sesion = await this.storage.get('usuario_sesion');
    if (sesion) {
      this.usuarioActivo = sesion;
      this.nombreEditado = sesion.nombre;
      this.avatarPreview = sesion.avatar || 'assets/profile-placeholder.svg';
      this.estaLogueado = true;
      await this.cargarDatos();
    }
  }

  async ionViewWillEnter() {
    if (this.estaLogueado) {
      this.historial = await this.cartService.getOrders();
      this.notificaciones = await this.cartService.getNotifications();
    }
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
      avatar: 'assets/profile-placeholder.svg'
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

    this.avatarPreview = await this.archivoADataUrl(file);
    input.value = '';
    await this.mostrarToast('Imagen lista. Guarda el perfil para conservarla.');
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
