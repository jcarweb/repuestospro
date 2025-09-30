import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'store_manager' | 'seller';
  status?: 'active' | 'inactive';
  storeId?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: 'admin' | 'store_manager' | 'seller';
  status?: 'active' | 'inactive';
  storeId?: string;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  storeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserManagementService {
  // Obtener todos los usuarios con paginación y filtros
  static async getUsers(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
    roleFilter: string = '',
    statusFilter: string = ''
  ) {
    try {
      const skip = (page - 1) * limit;
      
      // Construir filtros
      const filters: any = {};
      
      if (searchTerm) {
        filters.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ];
      }
      
      if (roleFilter) {
        filters.role = roleFilter;
      }
      
      if (statusFilter) {
        filters.status = statusFilter;
      }

      // Obtener usuarios
      const users = await User.find(filters)
        .select('-password')
        .populate('storeId', 'name address')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Contar total
      const total = await User.countDocuments(filters);

      return {
        success: true,
        users: users.map((user: any) => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.isActive ? 'active' : 'inactive',
          storeId: user.stores?.[0]?.toString(),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
        pagination: {
          totalUsers: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit: limit
        }
      };
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw new Error('Error al obtener usuarios');
    }
  }

  // Obtener usuario por ID
  static async getUserById(userId: string) {
    try {
      const user = await User.findById(userId)
        .select('-password')
        .populate('storeId', 'name address');

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.isActive ? 'active' : 'inactive',
          storeId: user.stores?.[0]?.toString(),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw new Error('Error al obtener usuario');
    }
  }

  // Crear nuevo usuario
  static async createUser(userData: UserCreateData) {
    try {
      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Crear usuario
      const newUser = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        status: userData.status || 'active',
        storeId: userData.storeId
      });

      await newUser.save();

      return {
        success: true,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.isActive ? 'active' : 'inactive',
          storeId: newUser.stores?.[0]?.toString(),
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        }
      };
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw new Error('Error al crear usuario');
    }
  }

  // Actualizar usuario
  static async updateUser(userId: string, userData: UserUpdateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar si el email ya existe en otro usuario
      if (userData.email && userData.email !== user.email) {
        const existingUser = await User.findOne({ 
          email: userData.email, 
          _id: { $ne: userId } 
        });
        if (existingUser) {
          throw new Error('El email ya está registrado por otro usuario');
        }
      }

      // Actualizar campos
      Object.keys(userData).forEach(key => {
        if (userData[key as keyof UserUpdateData] !== undefined) {
          (user as any)[key] = userData[key as keyof UserUpdateData];
        }
      });

      await user.save();

      return {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.isActive ? 'active' : 'inactive',
          storeId: user.stores?.[0]?.toString(),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw new Error('Error al actualizar usuario');
    }
  }

  // Eliminar usuario
  static async deleteUser(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      await User.findByIdAndDelete(userId);

      return {
        success: true,
        message: 'Usuario eliminado correctamente'
      };
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw new Error('Error al eliminar usuario');
    }
  }

  // Activar/Desactivar usuario
  static async toggleUserStatus(userId: string, status: 'active' | 'inactive') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      user.isActive = status === 'active';
      await user.save();

      return {
        success: true,
        message: `Usuario ${status === 'active' ? 'activado' : 'desactivado'} correctamente`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.isActive ? 'active' : 'inactive',
          storeId: user.stores?.[0]?.toString(),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      throw new Error('Error al cambiar estado del usuario');
    }
  }

  // Resetear contraseña
  static async resetPassword(userId: string, newPassword: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();

      return {
        success: true,
        message: 'Contraseña actualizada correctamente'
      };
    } catch (error) {
      console.error('Error reseteando contraseña:', error);
      throw new Error('Error al resetear contraseña');
    }
  }
}
