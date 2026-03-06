# New SMB Landing Page

## 🎯 Overview

A conversion-focused landing page targeting Portuguese SMBs (salões, ginásios, clínicas, oficinas) with rich visual content and real metrics.

## 📍 Access

- **URL**: `/new-landing`
- **Local**: http://localhost:3000/new-landing

## 🎨 Sections

### 1. Hero Section
**Visual Bento Grid with Real Content:**
- **Booking Calendar Card**: Shows sample appointments with "+60% Menos Faltas" metric
- **Customer Growth Chart**: Animated bar chart showing "+3x Este Mês" growth
- **Google Search Result**: Mock Google Business listing showing "#1 Na Sua Área"
- **Reviews Card**: 5-star rating with real testimonial "98% Satisfação"

**CTAs:**
- Primary: "Consulta Gratuita" (scroll to contact)
- Secondary: "Ligar Agora" (tel: link)

**Headline**: "Mais Clientes. Menos Trabalho."
**Value Prop**: "Aumente vendas em 3x e poupe 10 horas/semana"

### 2. Services Section
6 key services with icons:
- Sites Profissionais
- SEO Local
- Sistema de Marcações
- Gestão de Conteúdo (CMS)
- Automação
- Manutenção

### 3. Industries Section
4 target industries with specific features:
- **Salões & Barbearias**: Marcações 24/7, Galeria, Lembretes
- **Ginásios & Studios**: Calendário de aulas, Pagamentos online, Portal de membros
- **Clínicas & Consultórios**: Agendamento online, Lembretes, Área de pacientes
- **Oficinas & Reparações**: Orçamentos online, Rastreio, Notificações

### 4. Results/Social Proof
**Stats:**
- 50+ PMEs Atendidas
- 98% Satisfação de Clientes
- 3x Aumento Médio de Leads
- 24h Tempo de Resposta

**Testimonials:**
- Ana Silva (Salão Belle)
- Carlos Mendes (FitZone Gym)
- Dr. Pedro Costa (Clínica Dentária Sorrir+)

### 5. Contact Section
Full contact form with:
- Name, Email, Phone
- Business Type dropdown (Salão, Ginásio, Clínica, Oficina, Outro)
- Message textarea
- Submit: "Marcar Consulta Gratuita"

Direct contact info:
- Email: info@framax.pt
- Phone: +351 912 345 678

## 🎯 Key Differences from Current Landing

| Aspect | Current Landing | New SMB Landing |
|--------|----------------|-----------------|
| **Target** | General B2B | Portuguese SMBs |
| **Visual Style** | Bento grid dashboard | Bento grid with SMB metrics |
| **Content** | Generic business growth | Specific SMB pain points |
| **Metrics** | General stats | Industry-specific results |
| **CTAs** | "Book Meeting" | "Consulta Gratuita" + "Ligar Agora" |
| **Proof** | General testimonials | Named SMB testimonials |

## 🚀 Performance

- **Build Size**: 54.8 kB
- **First Load JS**: ~174 kB
- **Animations**: GSAP (lightweight, optimized)
- **Icons**: Lucide React (tree-shakeable)

## 🔧 Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- GSAP (animations)
- Lucide React (icons)
- i18n ready (Portuguese translations)

## 📝 To-Do (Future Enhancements)

1. **Connect Contact Form**: Wire up to actual email/CRM API
2. **Add Real Phone Number**: Update tel: links
3. **Industry Photos**: Add actual client photos to Industries section
4. **Video Background**: Consider adding subtle video in hero
5. **WhatsApp Integration**: Add WhatsApp CTA button
6. **Booking Widget**: Embed Calendly/similar directly in hero

## 🔄 Making This the Main Landing Page

When ready to replace the current landing page:

```bash
# 1. Backup current landing page
mv src/app/page.tsx src/app/page-backup.tsx

# 2. Copy new landing content
cp src/app/new-landing/page.tsx src/app/page.tsx

# 3. Update root layout with new metadata
# Copy metadata from src/app/new-landing/layout.tsx to src/app/layout.tsx

# 4. Move components (optional - can keep in new-landing folder)
# Components in src/components/new-landing/ will still work
```

## 📊 SEO Metadata

Already included in layout:
- **Title**: "Framax Solutions - Soluções Digitais para PMEs | Sites, SEO, Automação"
- **Description**: Optimized for SMB searches
- **Keywords**: Sites para pequenas empresas, sistema de marcações online, SEO local Portugal, etc.
- **Open Graph**: Configured for social sharing

## 🎨 Design Tokens

- **Primary Blue**: #2563EB
- **Background**: Black (#000000)
- **Font**: Outfit
- **Gradients**: Blue-400 to Blue-600 for accents
- **Card Backgrounds**: Color/10 opacity over black

## 📞 Contact Info to Update

Before going live, update these placeholders:
- Email: `info@framax.pt`
- Phone: `+351 912 345 678`
- CTASection.tsx line 350+ (contact form submission logic)
