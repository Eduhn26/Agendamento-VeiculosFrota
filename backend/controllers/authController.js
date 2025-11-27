const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔑 Tentando login:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Usuário não encontrado");
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const senhaCorreta = await bcrypt.compare(password, user.password);

    if (!senhaCorreta) {
      console.log("❌ Senha incorreta");
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login feito com sucesso:", email);

    return res.json({
      message: "Login autorizado",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        registrationId: user.registrationId,
      },
    });
  } catch (error) {
    console.error("🔥 Erro no login:", error);
    return res.status(500).json({ message: "Erro no servidor" });
  }
};


exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, registrationId } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPass,
      role: role || "user",
      department,
      registrationId,
    });

    return res.status(201).json({
      message: "Usuário registrado",
      user: newUser,
    });
  } catch (error) {
    console.error("🔥 Erro no registro:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};
