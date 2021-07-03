import mongoose from 'mongoose'
import bcrypt from 'bcrypt';

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/clientes', {useNewUrlParser: true});

// mongoose.set('setFindAndModify', false);

//mongoose.set('useUnifiedTopology', true);

const clientesSchema = new mongoose.Schema({
    nombre : String,
    apellido : String,
    empresa : String,
    emails : Array,
    edad : Number,
    tipo : String,
    pedidos : Array,
    idvendedor : mongoose.Types.ObjectId
});

//productos
const productosSchema = new mongoose.Schema({
    nombre : String,
    precio : Number,
    stock : Number
});

//pedidos
const pedidosSchema = new mongoose.Schema({
    pedido : Array,
    total : Number,
    fecha : Date,
    cliente: mongoose.Types.ObjectId,
    idvendedor: mongoose.Types.ObjectId,
    estado: String
});

//usuarios
const usuariosSchema = new mongoose.Schema({
    usuario : String,
    nombre: String,
    password : String,
    rol: String
});

usuariosSchema.pre('save', function(next) {
    if(!this.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, (error, salt) => {
        if (error) return next(error)
        bcrypt.hash(this.password, salt, (error, hash) => {
            if (error) return next(error)
            this.password = hash;
            next();
        })
    });
});

const Clientes = mongoose.model('clientes', clientesSchema);

const Productos = mongoose.model('productos', productosSchema);

const Pedidos = mongoose.model('pedidos', pedidosSchema);

const Usuarios = mongoose.model('usuarios', usuariosSchema);

export { Clientes, Productos, Pedidos, Usuarios };