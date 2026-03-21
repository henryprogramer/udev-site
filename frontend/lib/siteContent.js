export const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://udevstartup.com.br';

export const mission =
  'Desenvolver solucoes digitais eficientes que eliminem tarefas manuais e potencializem processos empresariais.';

export const values = [
  'Tecnologia pratica',
  'Eficiencia mensuravel',
  'Crescimento sustentavel'
];

export const originText =
  'A Udev nasceu de uma conversa entre tres amigos com visao compartilhada. O que comecou como ideia evoluiu para empresa estruturada. Hoje desenvolvemos solucoes digitais praticas para PMEs: sites, sistemas desktop, apps, CRMs, dashboards, automacoes e SaaS personalizados.';

export const socials = {
  instagram: 'https://instagram.com/SEU_PERFIL',
  youtube: 'https://youtube.com/@SEU_CANAL',
  linkedin: 'https://linkedin.com/company/SUA_PAGINA'
};

export const services = [
  {
    id: 'sites',
    title: 'Sites Institucionais',
    description: 'Presenca digital profissional para autoridade e captacao de leads.',
    category: 'web'
  },
  {
    id: 'sistemas',
    title: 'Sistemas de Gestao',
    description: 'Operacao interna com controle, rastreio e produtividade.',
    category: 'sistemas'
  },
  {
    id: 'dashboards',
    title: 'Dashboards e CRMs',
    description: 'Dados acionaveis para decisoes rapidas e previsiveis.',
    category: 'dados'
  },
  {
    id: 'saas',
    title: 'Plataformas SaaS',
    description: 'Produtos escalaveis orientados a receita recorrente.',
    category: 'saas'
  },
  {
    id: 'automacao',
    title: 'Automacao e Integracao',
    description: 'Menos retrabalho, mais velocidade operacional.',
    category: 'automacao'
  },
  {
    id: 'desktop',
    title: 'Apps Desktop',
    description: 'Aplicacoes robustas para operacoes de missao critica.',
    category: 'sistemas'
  }
];

export const products = [
  {
    id: 'site-performance',
    title: 'Site Institucional Performance',
    description: 'Landing institucional com foco em conversao e crescimento.',
    priceFrom: 'R$ 1.990'
  },
  {
    id: 'crm-comercial-udev',
    title: 'CRM Comercial Udev',
    description: 'Funil comercial com automacoes e visao de pipeline.',
    priceFrom: 'R$ 3.490'
  },
  {
    id: 'painel-executivo',
    title: 'Painel de Indicadores Executivo',
    description: 'KPIs operacionais e estrategicos em tempo real.',
    priceFrom: 'R$ 2.790'
  }
];

export const cases = [
  {
    id: 'funil-automatizado',
    title: 'Funil Comercial Automatizado',
    problem: 'Leads sem rastreio e baixa previsibilidade de vendas.',
    result: 'CRM com automacoes e painel de acompanhamento.',
    kpi: '+42% em oportunidades qualificadas em 90 dias',
    testimonial: 'A Udev transformou nossa operacao em poucas semanas, com resultado objetivo.'
  },
  {
    id: 'dashboard-operacional',
    title: 'Dashboard Operacional',
    problem: 'Decisoes baseadas em planilhas desconectadas.',
    result: 'Painel unico com indicadores por area e alertas.',
    kpi: '-31% no tempo de analise semanal',
    testimonial: 'A visibilidade melhorou e o time passou a agir com mais velocidade.'
  },
  {
    id: 'plataforma-servicos',
    title: 'Plataforma de Servicos',
    problem: 'Processo manual de contratacao e suporte.',
    result: 'MVP SaaS para onboarding, gestao e atendimento.',
    kpi: '+28% de retencao no primeiro ciclo trimestral',
    testimonial: 'A nova plataforma reduziu atrito e aumentou a recorrencia.'
  }
];

export const leaders = [
  {
    slug: 'pedro-henrique',
    name: 'Pedro Henrique',
    role: 'CEO & Arquiteto de Produto',
    image: '/assets/team/pedro_comfundo.png',
    shortBio:
      'Lider fundador responsavel pela visao estrategica e arquitetura de produto da Udev.',
    bio:
      'Lider fundador responsavel pela visao estrategica e arquitetura de produto da Udev. Atua em desenvolvimento web e desktop e na definicao de solucoes autorais. Foco: transformar necessidades em produtos escalaveis.',
    specialties: [
      'Arquitetura de Produto',
      'Desenvolvimento Web',
      'Desenvolvimento Desktop',
      'Estrategia de Produto'
    ],
    stack: ['React', 'Node.js', 'Electron', 'PostgreSQL'],
    contributions: [
      'Definicao de visao estrategica de produto.',
      'Priorizacao de roadmap por impacto de negocio.',
      'Estruturacao de ofertas orientadas a resultado.'
    ],
    goals: ['Consolidar portfolio de servicos.', 'Lancar produto autoral MVP.'],
    email: 'pedro@udev.com.br',
    linkedin: 'https://linkedin.com/in/pedro-henrique',
    github: 'https://github.com/pedrohenrique',
    projects: [
      {
        title: 'MVP SaaS Comercial',
        problem: 'Vendas sem previsibilidade.',
        solution: 'MVP com pipeline, automacoes e dashboard.',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        caseLink: '/cases#mvp-saas-comercial'
      },
      {
        title: 'Plataforma de Gestao Operacional',
        problem: 'Tarefas manuais e baixa padronizacao.',
        solution: 'Produto modular com trilhas de processo.',
        technologies: ['Electron', 'Node.js', 'SQL'],
        caseLink: '/cases#plataforma-gestao-operacional'
      },
      {
        title: 'Portal Institucional de Conversao',
        problem: 'Presenca digital sem foco em demanda.',
        solution: 'Landing com CTAs e funil de captacao.',
        technologies: ['HTML', 'Analytics', 'UI Kit'],
        caseLink: '/cases#portal-conversao'
      }
    ]
  },
  {
    slug: 'hetilon-araujo',
    name: 'Hetilon Araujo',
    role: 'Co-CEO & CTO',
    image: '/assets/team/hetilon_comfundo.png',
    shortBio: 'Responsavel pela engenharia e estabilidade tecnica da Udev.',
    bio:
      'Responsavel pela engenharia e estabilidade tecnica. Define arquiteturas, padroes de qualidade e supervisao da infraestrutura. Foco: execucao consistente e software confiavel.',
    specialties: ['Backend', 'Arquitetura', 'Infraestrutura', 'Qualidade'],
    stack: ['Node.js', 'Python', 'Docker', 'PostgreSQL'],
    contributions: [
      'Padronizacao de arquitetura e revisao tecnica.',
      'Criacao de pipelines de entrega confiaveis.',
      'Evolucao de observabilidade e estabilidade.'
    ],
    goals: [
      'Estabelecer pipelines de CI/CD.',
      'Escalar arquitetura para multiplas instancias.'
    ],
    email: 'hetilon@udev.com.br',
    linkedin: 'https://linkedin.com/in/hetilon-araujo',
    github: 'https://github.com/hetilon',
    projects: [
      {
        title: 'Arquitetura Multi-tenant',
        problem: 'Crescimento de clientes sem isolamento tecnico.',
        solution: 'Modelo multi-tenant com seguranca e observabilidade.',
        technologies: ['Node.js', 'PostgreSQL', 'Docker'],
        caseLink: '/cases#arquitetura-multi-tenant'
      },
      {
        title: 'Pipeline CI/CD Padronizado',
        problem: 'Deploy manual com alto risco.',
        solution: 'Pipeline automatizado com gates de qualidade.',
        technologies: ['GitHub Actions', 'Docker', 'Tests'],
        caseLink: '/cases#pipeline-cicd'
      },
      {
        title: 'Monitoramento de Servicos',
        problem: 'Falhas sem visibilidade em producao.',
        solution: 'Painel de saude com alertas e SLA.',
        technologies: ['Grafana', 'Prometheus', 'REST APIs'],
        caseLink: '/cases#monitoramento-servicos'
      }
    ]
  },
  {
    slug: 'kaua-emanuel',
    name: 'Kaua Emanuel',
    role: 'CFO & Diretor Hardware/Robotica',
    image: '/assets/team/kaua_comfundo.png',
    shortBio: 'Responsavel por sustentabilidade financeira e inovacao fisico-digital.',
    bio:
      'Responsavel pela administracao financeira e pelo desenvolvimento de prototipos e integracao hardware-software. Foco: sustentabilidade financeira e inovacao fisico-digital.',
    specialties: ['Financas', 'Precificacao', 'Prototipagem', 'Integracao IoT'],
    stack: ['BI', 'Python', 'IoT', 'MQTT'],
    contributions: [
      'Governanca financeira com previsibilidade de caixa.',
      'Modelo de precificacao por valor e risco.',
      'Conexao entre software e prototipos fisicos.'
    ],
    goals: ['Estruturar area de hardware.', 'Validar produto fisico simples.'],
    email: 'kaua@udev.com.br',
    linkedin: 'https://linkedin.com/in/kaua-emanuel',
    github: 'https://github.com/kauaemanuel',
    projects: [
      {
        title: 'Modelo de Precificacao de Servicos',
        problem: 'Margens inconsistentes em projetos.',
        solution: 'Framework de precificacao por esforco e valor.',
        technologies: ['BI', 'SQL', 'Modelagem'],
        caseLink: '/cases#precificacao-servicos'
      },
      {
        title: 'Prototipo de Monitoramento Fisico',
        problem: 'Dados operacionais sem captura automatica.',
        solution: 'POC com sensores integrados ao dashboard.',
        technologies: ['IoT', 'API', 'Dashboard'],
        caseLink: '/cases#monitoramento-fisico'
      },
      {
        title: 'Painel Financeiro Estrategico',
        problem: 'Baixa previsibilidade de caixa.',
        solution: 'Dashboard com cenario e alertas proativos.',
        technologies: ['ETL', 'BI', 'SQL'],
        caseLink: '/cases#painel-financeiro'
      }
    ]
  },
  {
    slug: 'isaque-silva',
    name: 'Isaque Silva',
    role: 'Lead Designer & CDO',
    image: '/assets/team/isaque_comfundo.png',
    shortBio: 'Responsavel por identidade visual e UX da Udev.',
    bio:
      'Responsavel pela identidade visual e UX. Transforma rascunhos em interfaces consistentes e escalaveis. Foco: experiencia intuitiva e padronizacao estetica.',
    specialties: ['UI/UX', 'Identidade Visual', 'Design de Produto', 'Prototipagem'],
    stack: ['Figma', 'Design Tokens', 'Wireframes', 'Prototype'],
    contributions: [
      'Padronizacao visual em canais institucionais e comerciais.',
      'Estruturacao de design system reutilizavel.',
      'Evolucao de conversao via melhoria de UX.'
    ],
    goals: ['Padronizar design system.', 'Elevar conversao via UX.'],
    email: 'isaque@udev.com.br',
    linkedin: 'https://linkedin.com/in/isaque-silva',
    github: 'https://github.com/isaquesilva',
    projects: [
      {
        title: 'Design System Udev',
        problem: 'Interfaces inconsistentes e retrabalho.',
        solution: 'Biblioteca de componentes e tokens visuais.',
        technologies: ['Figma', 'Tokens', 'UI Kit'],
        caseLink: '/cases#design-system-udev'
      },
      {
        title: 'Redesign da Landing Principal',
        problem: 'Baixa clareza de proposta e CTA.',
        solution: 'Fluxo visual de conversao com hierarquia clara.',
        technologies: ['UX Writing', 'Prototype', 'Usability'],
        caseLink: '/cases#redesign-landing'
      },
      {
        title: 'Kit Visual de Portfolios',
        problem: 'Paginas pessoais sem padrao institucional.',
        solution: 'Template modular com foco em autoridade.',
        technologies: ['Componentes', 'Layout', 'Visual System'],
        caseLink: '/cases#kit-visual-portfolio'
      }
    ]
  }
];

export const timeline = [
  { date: '29/03/2023', label: 'Fundacao da ideia e alinhamento de visao.' },
  { date: '30/11/2025', label: 'Reuniao de estruturacao oficial da Udev.' },
  { date: '2026', label: 'Padronizacao operacional e expansao de carteira.' },
  { date: '2027', label: 'Lancamento de novas solucoes autorais.' },
  { date: '2028', label: 'Escala de produtos e novos mercados.' },
  { date: '2029-2030', label: 'Consolidacao do ecossistema Udev.' }
];
