import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/biometric_service.dart';
import '../providers/auth_provider.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class BiometricSetupScreen extends StatefulWidget {
  const BiometricSetupScreen({Key? key}) : super(key: key);

  @override
  State<BiometricSetupScreen> createState() => _BiometricSetupScreenState();
}

class _BiometricSetupScreenState extends State<BiometricSetupScreen> {
  final BiometricService _biometricService = BiometricService();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  
  bool _isLoading = false;
  bool _biometricAvailable = false;
  String? _error;
  bool _showCredentialsInput = false;

  @override
  void initState() {
    super.initState();
    _checkBiometricAvailability();
  }
  
  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _checkBiometricAvailability() async {
    final available = await _biometricService.canUseBiometric();
    setState(() {
      _biometricAvailable = available;
    });
  }

  void _showCredentialsForm() {
    setState(() {
      _showCredentialsInput = true;
    });
  }

  Future<void> _enableBiometric() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
        setState(() {
            _error = 'Por favor ingresa tus credenciales para confirmar';
        });
        return;
    }
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // 1. Verify credentials valid via login first? 
      // For now we assume they are correct or we rely on AuthProvider to verify them implicitly/explicitly
      // Ideally we would verify them against backend before enabling biometric.
      
      // 2. Authenticate with biometric to confirm ownership
      final authenticated = await _biometricService.authenticate(
        localizedReason: 'Confirma tu identidad para activar el inicio con huella',
      );

      if (!authenticated) {
        setState(() {
          _error = 'Autenticación biométrica cancelada';
          _isLoading = false;
        });
        return;
      }

      // 3. Enable biometric in auth provider (stores creds securely)
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final success = await authProvider.enableBiometric(_emailController.text, _passwordController.text);

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('¡Huella digital configurada exitosamente!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      } else if (mounted) {
        setState(() {
          _error = 'No se pudo habilitar. Verifica tus credenciales.';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configurar Huella Digital'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 20),
            
            // Icon
            if (!_showCredentialsInput) ...[
                Center(
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: _biometricAvailable ? Colors.green[50] : Colors.grey[200],
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.fingerprint,
                      size: 60,
                      color: _biometricAvailable ? Colors.green[600] : Colors.grey[400],
                    ),
                  ),
                ),
                const SizedBox(height: 30),
                
                Text(
                  _biometricAvailable 
                    ? 'Habilita el inicio con huella digital'
                    : 'Huella digital no disponible',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                
                const SizedBox(height: 16),
                
                Text(
                  _biometricAvailable
                    ? 'Usa tu huella digital para iniciar sesión de forma rápida y segura. Necesitaremos confirmar tus credenciales una vez más.'
                    : 'Tu dispositivo no tiene sensor de huella digital habilitado o no tiene huellas registradas.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 40),
            ],

            // Credentials Form
            if (_showCredentialsInput) ...[
                const Text(
                  'Confirma tus credenciales',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                CustomTextField(
                    controller: _emailController,
                    label: 'Correo Electrónico',
                    keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                    controller: _passwordController,
                    label: 'Contraseña',
                    obscureText: true,
                ),
                const SizedBox(height: 30),
            ],
            
            // Error message
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red[200]!),
                ),
                child: Text(
                  _error!,
                  style: TextStyle(color: Colors.red[700]),
                  textAlign: TextAlign.center,
                ),
              ),
            
            // Enable button
            if (_biometricAvailable)
              CustomButton(
                onPressed: _isLoading 
                    ? null 
                    : (_showCredentialsInput ? _enableBiometric : _showCredentialsForm),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(_showCredentialsInput ? Icons.check : Icons.fingerprint),
                          const SizedBox(width: 8),
                          Text(_showCredentialsInput ? 'Confirmar y Activar' : 'Configurar Ahora'),
                        ],
                      ),
              ),
            
            const SizedBox(height: 16),
            
            // Skip/Cancel button
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text(_showCredentialsInput ? 'Cancelar' : 'Volver'),
            ),
          ],
        ),
      ),
    );
  }
}
