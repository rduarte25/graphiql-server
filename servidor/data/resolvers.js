import mongoose from 'mongoose';
import { Clientes, Productos, Pedidos, Usuarios } from './db';
import { rejects } from 'assert';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
const ObjectId = mongoose.Types.ObjectId;

require("dotenv").config();

const crearToken = (usuarioLogin, secretOrPrivateKey,{expiresIn}) => {
    const {usuario} = usuarioLogin;
    return jwt.sign({usuario}, secretOrPrivateKey, expiresIn);
}

export const resolvers = {
    Query: {
        getClientes: (root, {limit, offset, idvendedor}) => {
            let filtro;
            if (idvendedor) {
                filtro = {idvendedor: new ObjectId(idvendedor)}
            }
            return Clientes.find(filtro).limit(limit).skip(offset)
        },
        getCliente: (root, 
            {id}) => {
            return new Promise((resolve, object) => {
                Clientes.findById(id , (error, cliente) => {
                    if (error) rejects(error)
                    else resolve(cliente);
                })
            })
        },
        totalClientes: (root, { idvendedor}) => {
            let filtro;
            if (idvendedor) {
                filtro = {idvendedor: new ObjectId(idvendedor)}
            }
            return new Promise((resolve, object) => {
                Clientes.countDocuments(filtro, (error, count) => {
                    if (error) rejects(error)
                    else resolve(count);
                })
            })
        },

        //productos
        getProductos: (root, {limit, offset, stock}) => {
            let filtro;
            if (stock) {
                filtro = { stock: {$gt : 0} }
            }
            return Productos.find(filtro).limit(limit).skip(offset)
        },
        getProducto: (root, 
            {id}) => {
            return new Promise((resolve, object) => {
                Productos.findById(id , (error, producto) => {
                    if (error) rejects(error)
                    else resolve(producto);
                })
            })
        },
        totalProductos: (root) => {
            return new Promise((resolve, object) => {
                Productos.countDocuments({}, (error, count) => {
                    if (error) rejects(error)
                    else resolve(count);
                })
            })
        },
        //pedidos
        getPedidos: (root, {cliente}) => {
            return new Promise((resolve, object) => {
                Pedidos.find({cliente: cliente} , (error, pedido) => {
                    if (error) rejects(error)
                    else resolve(pedido);
                })
            })
        },
        topClientes : (root) => {
            return new Promise((resolve, object) => {
                Pedidos.aggregate([
                    {
                        $match : { estado: "COMPLETADO" }
                    },
                    {
                        $group : {
                            _id : "$cliente",
                            total: { $sum : "$total" }
                        }
                    },
                    {
                        $lookup : {
                            from: "clientes",
                            localField : '_id',
                            foreignField : '_id',
                            as : 'cliente'
                        }
                    },
                    {
                        $sort : { total : -1 }
                    },
                    {
                        $limit : 10
                    }
                ], (error, result) => {
                    if (error) rejects(error)
                    else resolve(result);
                })
            })
        },
        topVendedores : (root) => {
            return new Promise((resolve, object) => {
                Pedidos.aggregate([
                    {
                        $match : { estado: "COMPLETADO" }
                    },
                    {
                        $group : {
                            _id : "$idvendedor",
                            total: { $sum : "$total" }
                        }
                    },
                    {
                        $lookup : {
                            from: "usuarios",
                            localField : '_id',
                            foreignField : '_id',
                            as : 'usuario'
                        }
                    },
                    {
                        $sort : { total : -1 }
                    },
                    {
                        $limit : 10
                    }
                ], (error, result) => {
                    if (error) rejects(error)
                    else resolve(result);
                })
            })
        },
        getPedido: (root, 
            {id}) => {
            return new Promise((resolve, object) => {
                Pedidos.findById(id , (error, pedido) => {
                    if (error) rejects(error)
                    else resolve(pedido);
                })
            })
        },
        totalPedidos: (root) => {
            return new Promise((resolve, object) => {
                Pedidos.countDocuments({}, (error, count) => {
                    if (error) rejects(error)
                    else resolve(count);
                })
            })
        },
        getUsuario: (root, args, {usuarioActual}) => {
            if ( !usuarioActual ) {
                return null;
            }
            const usuario = Usuarios.findOne({usuario: usuarioActual.usuario});

            return usuario;
        }
    },
    Mutation: {
        crearCliente: (root, {input}) => {
            const nuevoCliente = new Clientes({
                nombre : input.nombre,
                apellido : input.apellido,
                empresa : input.empresa,
                emails : input.emails,
                edad : input.edad,
                tipo : input.tipo,
                pedidos : input.pedidos,
                idvendedor : input.idvendedor
            });
            nuevoCliente.id = nuevoCliente._id;
            return new Promise((resolve, object) => {
                nuevoCliente.save((error) => {
                    if (error) rejects(error)
                    else resolve(nuevoCliente);
                });
            })
        },
        actualizarCliente: (root, {input}) => {
            return new Promise((resolve, object) => {
                Clientes.findOneAndUpdate({_id : input.id }, input, {new: true}, (error, cliente) => {
                    if (error) rejects(error)
                    else resolve(cliente);
                })
            })
        },
        eliminarCliente: (root, {id}) => {
            return new Promise((resolve, object) => {
                Clientes.findOneAndDelete({_id : id }, (error, cliente) => {
                    if (error) rejects(error)
                    else resolve("Se eliminó Correctamente");
                })
            })
        },
        //Producto
        crearProducto: (root, {input}) => {
            const nuevoProducto = new Productos({
                nombre : input.nombre,
                precio : input.precio,
                stock : input.stock
            });
            nuevoProducto.id = nuevoProducto._id;
            return new Promise((resolve, object) => {
                nuevoProducto.save((error) => {
                    if (error) rejects(error)
                    else resolve(nuevoProducto);
                });
            })
        },
        actualizarProducto: (root, {input}) => {
            return new Promise((resolve, object) => {
                Productos.findOneAndUpdate({_id : input.id }, input, {new: true}, (error,producto) => {
                    if (error) rejects(error)
                    else resolve(producto);
                })
            })
        },
        eliminarProducto: (root, {id}) => {
            return new Promise((resolve, object) => {
                Productos.findOneAndDelete({_id : id }, (error, producto) => {
                    if (error) rejects(error)
                    else resolve("Se eliminó Correctamente");
                })
            })
        },
        //Pedidos
        crearPedido: (root, {input}) => {
            const nuevoPedido = new Pedidos({
                pedido : input.pedido,
                total : input.total,
                fecha : new Date(),
                cliente : input.cliente,
                idvendedor: input.idvendedor,
                estado : "PENDIENTE"
            });
            nuevoPedido.id = nuevoPedido._id;
            return new Promise((resolve, object) => {
                nuevoPedido.save((error) => {
                    if (error) rejects(error)
                    else resolve(nuevoPedido);
                });
            })
        },
        actualizarPedido: (root, {input}) => {
            return new Promise((resolve, object) => {

                const { estado } = input;

                let instruccion;

                if ( estado === 'COMPLETADO' ) {
                    instruccion = '-';
                } else if ( estado === 'CANCELADO' ) {
                    instruccion = '+';
                }

                input.pedido.forEach(pedido => {
                    Productos.updateOne({_id : pedido.id}, {
                            "$inc": {"stock" : `${instruccion}${pedido.cantidad}`}
                        }, function(error) {
                            if(error) return new Error(error)
                        }
                    )
                })
                Pedidos.findOneAndUpdate({_id : input.id }, input, {new: true}, (error,pedido) => {
                    if (error) rejects(error)
                    else resolve(pedido);
                })
            })
        },
        eliminarPedido: (root, {id}) => {
            return new Promise((resolve, object) => {
                Pedido.findOneAndDelete({_id : id }, (error, pedido) => {
                    if (error) rejects(error)
                    else resolve("Se eliminó Correctamente");
                })
            })
        },
        //Usuarios
        crearUsuario: async (root, {usuario, nombre, password, rol}) => {
            const existeUsuario = await Usuarios.findOne({usuario});

            if ( existeUsuario ) {
                throw new Error('El usuario ya existe.')
            }
            const nuevoUsuario = await new Usuarios({
                usuario,
                nombre,
                password,
                rol
            }).save();
            return "Creado Correctamente";
        },
        autenticarUsuario : async (root, {usuario, password}) => {
            const nombreUsuario = await Usuarios.findOne({usuario});
            if ( !nombreUsuario ) {
                throw new Error('Usuario no encontrado.')
            }
            const passwordCorrecto = await bcrypt.compare(password, nombreUsuario.password);
            if( !passwordCorrecto ) {
                throw new Error('Password Incorrecto.')
            }

            return {
                token: crearToken(nombreUsuario, process.env.SECRETO, "1h")
            }
        }        
    }
}

export default resolvers;