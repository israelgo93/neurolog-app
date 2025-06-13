// src/app/page.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Users, BookOpen, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      icon: Heart,
      title: "Seguimiento emocional",
      description: "Registra y monitorea el estado emocional diario del niño con herramientas especializadas."
    },
    {
      icon: Users,
      title: "Colaboración",
      description: "Conecta padres, docentes y especialistas en una plataforma unificada."
    },
    {
      icon: BookOpen,
      title: "Registro detallado",
      description: "Documenta comportamientos, avances y observaciones de manera estructurada."
    },
    {
      icon: BarChart3,
      title: "Análisis de progreso",
      description: "Visualiza tendencias y patrones para tomar mejores decisiones."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">NL</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NeuroLog</span>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Registrarse</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Registro especializado para{' '}
          <span className="text-blue-600">niños con NEE</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Una plataforma integral para el seguimiento y documentación del desarrollo 
          de niños con necesidades educativas especiales, facilitando la colaboración 
          entre todos los cuidadores.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/register">Comenzar gratis</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#features">Conocer más</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Herramientas especializadas
          </h2>
          <p className="text-xl text-gray-600">
            Diseñado específicamente para las necesidades de seguimiento en NEE
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-blue-600 text-white text-center p-8">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">
              ¿Listo para comenzar?
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Únete a NeuroLog y mejora el seguimiento del desarrollo de tus niños
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">Crear cuenta gratuita</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 NeuroLog. Todos los derechos reservados.</p>
          <p className="mt-2 text-sm">
            Proyecto académico - Arquitectura del Software
          </p>
        </div>
      </footer>
    </div>
  )
}