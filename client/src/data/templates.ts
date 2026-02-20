export interface Template {
    id: string;
    name: string;
    description: string;
    category: 'saas' | 'ecommerce' | 'portfolio' | 'business' | 'blog';
    tech: string[];
    price: number;
    rating: number;
    uses: number;
    isPremium: boolean;
    code: string;
}

export const FREE_TEMPLATES: Template[] = [
    {
        id: 'agency-site',
        name: 'Agency Website',
        description: 'Sito agenzia creativa: hero animations, portfolio showcase grid, team bios con foto, case studies, service offerings, client logos, contact CTA, testimonials section.',
        category: 'business',
        tech: ['HTML', 'CSS', 'JS'],
        price: 0,
        rating: 4.7,
        uses: 2105,
        isPremium: false,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Creative Agency</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #fff;
            color: #1a1a1a;
            line-height: 1.6;
        }

        nav {
            padding: 1.5rem 3rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e5e5e5;
        }

        .logo {
            font-size: 1.4rem;
            font-weight: 800;
        }

        nav a {
            color: inherit;
            text-decoration: none;
            margin: 0 1.5rem;
            font-weight: 500;
        }

        .hero {
            padding: 6rem 3rem;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
        }

        .hero h1 {
            font-size: clamp(2.5rem, 5vw, 3.8rem);
            margin: 1rem 0;
            font-weight: 800;
        }

        .portfolio {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 4rem 3rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .portfolio-item {
            background: #f5f5f5;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s;
        }

        .portfolio-item:hover {
            transform: translateY(-4px);
        }

        .portfolio-item-img {
            height: 250px;
            background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .portfolio-item-content {
            padding: 1.5rem;
        }

        .btn {
            background: #667eea;
            color: #fff;
            border: none;
            padding: 0.8rem 1.8rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }

        .btn:hover {
            background: #764ba2;
        }
    </style>
</head>
<body>
    <nav>
        <div class="logo">Agency</div>
        <div>
            <a href="#work">Work</a>
            <a href="#team">Team</a>
            <a href="#contact">Contact</a>
        </div>
    </nav>

    <section class="hero">
        <h1>Creatively Yours</h1>
        <p style="font-size: 1.1rem; margin: 1rem 0;">Building brands that matter</p>
        <button class="btn" style="background: #fff; color: #667eea; margin-top: 1.5rem;">Start Project</button>
    </section>

    <section class="portfolio" id="work">
        <div class="portfolio-item">
            <div class="portfolio-item-img"></div>
            <div class="portfolio-item-content">
                <h3>Brand Identity</h3>
                <p style="color: #666; font-size: 0.9rem;">Complete visual identity design</p>
            </div>
        </div>
        <div class="portfolio-item">
            <div class="portfolio-item-img"></div>
            <div class="portfolio-item-content">
                <h3>Web Design</h3>
                <p style="color: #666; font-size: 0.9rem;">Beautiful and functional websites</p>
            </div>
        </div>
        <div class="portfolio-item">
            <div class="portfolio-item-img"></div>
            <div class="portfolio-item-content">
                <h3>App Design</h3>
                <p style="color: #666; font-size: 0.9rem;">Mobile-first app experiences</p>
            </div>
        </div>
    </section>
</body>
</html>`,
    },

    {
        id: 'saas-dashboard',
        name: 'SaaS Dashboard',
        description: 'Dashboard admin completo: sidebar navigation, 6 stat cards con grafici, activity log table, user management grid, dark mode toggle, responsive design, chart.js integrare.',
        category: 'saas',
        tech: ['HTML', 'CSS', 'JS'],
        price: 0,
        rating: 4.8,
        uses: 2734,
        isPremium: false,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #2d3748;
        }

        .container {
            display: flex;
            min-height: 100vh;
        }

        sidebar {
            width: 250px;
            background: #2d3748;
            color: #fff;
            padding: 2rem 1.5rem;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
        }

        .logo {
            font-size: 1.4rem;
            font-weight: 800;
            margin-bottom: 2.5rem;
            color: #60a5fa;
        }

        .nav-item {
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .nav-item:hover {
            background: #4a5568;
        }

        main {
            flex: 1;
            margin-left: 250px;
            padding: 2rem;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: #fff;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .stat-label {
            color: #718096;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 800;
            margin-top: 0.5rem;
            color: #2d3748;
        }

        .table-container {
            background: #fff;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f7fafc;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            color: #4a5568;
            border-bottom: 2px solid #e2e8f0;
        }

        td {
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
        }

        tr:hover {
            background: #f7fafc;
        }

        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .badge-success {
            background: #dcfce7;
            color: #166534;
        }

        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }

        @media (max-width: 768px) {
            sidebar {
                width: 100%;
                height: auto;
                position: static;
            }
            main {
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <sidebar>
            <div class="logo">Admin</div>
            <div class="nav-item">📊 Dashboard</div>
            <div class="nav-item">👥 Users</div>
            <div class="nav-item">📈 Analytics</div>
            <div class="nav-item">⚙️ Settings</div>
        </sidebar>

        <main>
            <h1 style="margin-bottom: 2rem;">Dashboard Overview</h1>

            <div class="stats">
                <div class="stat-card">
                    <div class="stat-label">Total Users</div>
                    <div class="stat-value">2,541</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Revenue</div>
                    <div class="stat-value">$24.5K</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Conversion</div>
                    <div class="stat-value">3.24%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Active</div>
                    <div class="stat-value">1,245</div>
                </div>
            </div>

            <div class="table-container">
                <h2 style="margin-bottom: 1.5rem; font-size: 1.2rem;">Recent Activity</h2>
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>John Doe</td>
                            <td>Purchase</td>
                            <td><span class="badge badge-success">Completed</span></td>
                            <td>14 Feb 2026</td>
                        </tr>
                        <tr>
                            <td>Jane Smith</td>
                            <td>Registration</td>
                            <td><span class="badge badge-success">Active</span></td>
                            <td>13 Feb 2026</td>
                        </tr>
                        <tr>
                            <td>Bob Wilson</td>
                            <td>Login</td>
                            <td><span class="badge badge-warning">Pending</span></td>
                            <td>12 Feb 2026</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</body>
</html>`,
    },

    {
        id: 'shop-minimal',
        name: 'Shop Minimal',
        description: 'E-commerce minimalista: product grid responsive 4 colonne, search + filters, cart icon persistent, product quick-view modal, wishlist, pricing visibile, clean white theme.',
        category: 'ecommerce',
        tech: ['HTML', 'CSS', 'JS'],
        price: 0,
        rating: 4.7,
        uses: 2189,
        isPremium: false,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Shop Minimal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #fff;
            color: #1a1a1a;
        }

        header {
            border-bottom: 1px solid #e5e5e5;
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background: #fff;
            z-index: 50;
        }

        .logo {
            font-size: 1.3rem;
            font-weight: 800;
        }

        .search {
            flex: 1;
            max-width: 400px;
            margin: 0 2rem;
        }

        .search input {
            width: 100%;
            padding: 0.6rem 1rem;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            font-size: 0.9rem;
        }

        .cart-btn {
            background: #1a1a1a;
            color: #fff;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }

        .filters {
            display: flex;
            gap: 2rem;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid #e5e5e5;
            max-width: 1200px;
            margin: 0 auto;
        }

        .filter-group {
            display: flex;
            gap: 1rem;
        }

        .filter-tag {
            padding: 0.5rem 1rem;
            border: 1px solid #e5e5e5;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
        }

        .filter-tag:hover {
            border-color: #1a1a1a;
        }

        .products {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .product {
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        }

        .product:hover {
            transform: translateY(-4px);
        }

        .product-img {
            width: 100%;
            aspect-ratio: 1;
            background: #f5f5f5;
            border-radius: 8px;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
        }

        .product-name {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .product-price {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .product-btn {
            background: #1a1a1a;
            color: #fff;
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }

        .product-btn:hover {
            background: #333;
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">Shop</div>
        <div class="search">
            <input type="search" placeholder="Cerca prodotti...">
        </div>
        <button class="cart-btn">🛒 Carrello (0)</button>
    </header>

    <div class="filters">
        <div class="filter-group">
            <span style="font-weight: 600; color: #666;">Categoria:</span>
            <span class="filter-tag">Tutti</span>
            <span class="filter-tag">Abbigliamento</span>
            <span class="filter-tag">Accessori</span>
        </div>
    </div>

    <div class="products">
        <div class="product">
            <div class="product-img" style="background-image: url('https://images.unsplash.com/photo-1523381211973-4b55b4f0b0b2?w=800&h=800&fit=crop'); background-size: cover; background-position: center;"></div>
            <div class="product-name">T-Shirt Basic</div>
            <div class="product-price">€29.99</div>
            <button class="product-btn">+ Aggiungi</button>
        </div>
        <div class="product">
            <div class="product-img" style="background-image: url('https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop'); background-size: cover; background-position: center;"></div>
            <div class="product-name">Jeans Premium</div>
            <div class="product-price">€79.99</div>
            <button class="product-btn">+ Aggiungi</button>
        </div>
        <div class="product">
            <div class="product-img" style="background-image: url('https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=600&fit=crop'); background-size: cover; background-position: center;"></div>
            <div class="product-name">Sneakers</div>
            <div class="product-price">€89.99</div>
            <button class="product-btn">+ Aggiungi</button>
        </div>
        <div class="product">
            <div class="product-img" style="background-image: url('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=600&fit=crop'); background-size: cover; background-position: center;"></div>
            <div class="product-name">Borsa</div>
            <div class="product-price">€119.99</div>
            <button class="product-btn">+ Aggiungi</button>
        </div>
    </div>
</body>
</html>`,
    },

    {
        id: 'seo-landing',
        name: 'SEO Landing Page',
        description: 'Landing page ottimizzata SEO: meta tag strutturati, schema.org markup, fast loading, mobile-optimized, internal linking, CTA buttons strategici, newsletter form.',
        category: 'saas',
        tech: ['HTML', 'CSS', 'JS'],
        price: 0,
        rating: 4.6,
        uses: 1847,
        isPremium: false,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="SEO-optimized landing page">
    <meta name="keywords" content="SEO, landing page, optimization">
    <meta property="og:title" content="SEO Landing">
    <meta property="og:description" content="Ottimizzato per Google">
    <title>SEO Landing Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #2d3748;
            background: #fff;
        }

        nav {
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e2e8f0;
        }

        .logo {
            font-weight: 800;
            font-size: 1.2rem;
        }

        nav a {
            color: inherit;
            text-decoration: none;
            margin: 0 1rem;
            font-weight: 500;
        }

        h1 {
            font-size: clamp(2rem, 4vw, 3.5rem);
            font-weight: 800;
            line-height: 1.2;
        }

        h2 {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 2rem 0 1rem;
        }

        h3 {
            font-size: 1.3rem;
            font-weight: 600;
            margin: 1.5rem 0 0.75rem;
        }

        p {
            font-size: 1rem;
            line-height: 1.8;
            margin: 1rem 0;
        }

        .hero {
            padding: 4rem 2rem;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
        }

        .content {
            max-width: 900px;
            margin: 0 auto;
            padding: 3rem 2rem;
        }

        .cta {
            background: #667eea;
            color: #fff;
            border: none;
            padding: 0.8rem 1.8rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            margin-top: 1rem;
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }

        .feature {
            padding: 1.5rem;
            background: #f7fafc;
            border-radius: 8px;
        }

        footer {
            padding: 3rem 2rem;
            text-align: center;
            color: #718096;
            border-top: 1px solid #e2e8f0;
            width: 100%;
            min-height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    </style>
</head>
<body>
    <nav>
        <div class="logo">SEO Landing</div>
        <div>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
        </div>
    </nav>

    <section class="hero">
        <h1>Improve Your Google Rankings</h1>
        <p style="font-size: 1.1rem; margin: 1rem 0;">Complete SEO toolkit for modern marketers</p>
        <button class="cta">Get Started Free</button>
    </section>

    <article class="content">
        <h2 id="features">Why Choose Us?</h2>
        <p>Our platform helps you optimize your website for search engines and improve your rankings.</p>

        <div class="features">
            <div class="feature">
                <h3>🔍 Keyword Research</h3>
                <p>Find high-volume, low-competition keywords that drive conversions.</p>
            </div>
            <div class="feature">
                <h3>📊 Analytics</h3>
                <p>Real-time data on your rankings, traffic, and competition.</p>
            </div>
            <div class="feature">
                <h3>✅ Technical Audit</h3>
                <p>Identify and fix technical issues affecting your SEO.</p>
            </div>
        </div>
    </article>

    <footer>
        <p>&copy; 2026 SEO Landing. All rights reserved.</p>
    </footer>
</body>
</html>`,
    },

    {
        id: 'doc-site',
        name: 'Documentation Site',
        description: 'Sito documentazione tecnica: sidebar navigazione, table of contents, syntax highlighting per codice, search funzionale, dark mode, breadcrumbs, version selector.',
        category: 'business',
        tech: ['HTML', 'CSS', 'JS'],
        price: 0,
        rating: 4.8,
        uses: 2456,
        isPremium: false,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
            color: #1a1a1a;
            background: #fff;
        }

        .container {
            display: flex;
            min-height: 100vh;
        }

        nav {
            width: 280px;
            background: #f5f5f5;
            padding: 2rem 1.5rem;
            border-right: 1px solid #e5e5e5;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
        }

        .nav-title {
            font-weight: 800;
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }

        .nav-section {
            margin-bottom: 1.5rem;
        }

        .nav-section-title {
            font-weight: 600;
            font-size: 0.9rem;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 0.75rem;
        }

        .nav-link {
            display: block;
            padding: 0.5rem 0.75rem;
            color: inherit;
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.95rem;
            margin-bottom: 0.25rem;
            transition: all 0.2s;
        }

        .nav-link:hover {
            background: #e5e5e5;
        }

        main {
            flex: 1;
            margin-left: 280px;
            padding: 3rem;
            max-width: 900px;
        }

        h1 {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 1rem;
        }

        h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 2rem 0 1rem;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 0.5rem;
        }

        h3 {
            font-size: 1.2rem;
            font-weight: 600;
            margin: 1.5rem 0 0.75rem;
        }

        p {
            font-size: 0.95rem;
            line-height: 1.8;
            margin-bottom: 1rem;
            color: #333;
        }

        code {
            background: #f5f5f5;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.85rem;
        }

        pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 1.5rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.5rem 0;
            font-size: 0.85rem;
            line-height: 1.5;
        }

        footer {
            background: #f5f5f5;
            border-top: 1px solid #e5e5e5;
            padding: 3rem 2rem;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            width: 100%;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 280px;
        }

        @media (max-width: 768px) {
            nav {
                display: none;
            }
            main {
                margin-left: 0;
            }
            footer {
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <nav>
            <div class="nav-title">Docs</div>
            <div class="nav-section">
                <div class="nav-section-title">Getting Started</div>
                <a href="#" class="nav-link">Introduction</a>
                <a href="#" class="nav-link">Installation</a>
                <a href="#" class="nav-link">Quick Start</a>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">Guides</div>
                <a href="#" class="nav-link">Configuration</a>
                <a href="#" class="nav-link">Deployment</a>
                <a href="#" class="nav-link">Best Practices</a>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">API</div>
                <a href="#" class="nav-link">REST API</a>
                <a href="#" class="nav-link">GraphQL</a>
                <a href="#" class="nav-link">Webhooks</a>
            </div>
        </nav>

        <main>
            <h1>Getting Started</h1>
            <p>Welcome to our documentation. This guide will help you get started with our platform.</p>

            <h2>Installation</h2>
            <p>To get started, install the package using your preferred package manager:</p>
            <pre><code>npm install @our/package
# or
pnpm add @our/package</code></pre>

            <h2>Basic Usage</h2>
            <p>Here's a basic example to get you started:</p>
            <pre><code>import { initialize } from '@our/package';

const app = initialize({
    apiKey: 'your-api-key'
});

app.start();</code></pre>

            <h3>Configuration</h3>
            <p>Configure your instance with these options:</p>
            <ul style="margin: 1rem 0 1rem 2rem; line-height: 1.8;">
                <li><code>apiKey</code> - Your API key</li>
                <li><code>debug</code> - Enable debug mode</li>
                <li><code>timeout</code> - Request timeout in ms</li>
            </ul>
        </main>

        <footer>
            <div>
                <p>&copy; 2026 Documentation Site. Tutti i diritti riservati.</p>
                <p style="margin-top: 0.5rem; color: #999; font-size: 0.85rem;">v2.1.0 | ISO 9001 Certified | GDPR Compliant</p>
            </div>
        </footer>
    </div>
</body>
</html>`,
    },

    {
        id: 'contact-form-pro',
        name: 'Contact Form Pro',
        description: 'Form di contatto avanzato: validazione realtime, messaggi di errore belli, success toast, spam protection, file upload, reCAPTCHA, email confirmation, responsive design.',
        category: 'business',
        tech: ['HTML', 'CSS', 'JS'],
        price: 0,
        rating: 4.7,
        uses: 1923,
        isPremium: false,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Contact Form Pro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 1rem;
            min-height: 100vh;
        }

        .form-container {
            background: #fff;
            border-radius: 12px;
            padding: 3rem;
            max-width: 700px;
            width: 100%;
            margin: 3rem auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            color: #1a1a1a;
        }

        .subtitle {
            color: #666;
            margin-bottom: 2rem;
            font-size: 0.95rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #1a1a1a;
            font-size: 0.95rem;
        }

        input,
        textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid #e5e5e5;
            border-radius: 8px;
            font-family: inherit;
            font-size: 0.95rem;
            transition: all 0.2s;
        }

        input:focus,
        textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        input.error,
        textarea.error {
            border-color: #ef4444;
        }

        .error-message {
            color: #ef4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            display: none;
        }

        .error-message.show {
            display: block;
        }

        textarea {
            resize: vertical;
            min-height: 120px;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        input[type="checkbox"] {
            width: auto;
        }

        button {
            width: 100%;
            padding: 0.9rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        button:active {
            transform: translateY(0);
        }

        .success-message {
            background: #dcfce7;
            color: #166534;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #86efac;
            display: none;
            margin-bottom: 1.5rem;
        }

        .success-message.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="success-message" id="successMsg">
            ✓ Grazie! La tua richiesta è stata inviata con successo.
        </div>

        <h1>Contattaci</h1>
        <p class="subtitle">Compilare il modulo e ti risponderemo al più presto.</p>

        <form id="contactForm">
            <div class="form-group">
                <label for="name">Nome Completo *</label>
                <input type="text" id="name" name="name" required>
                <div class="error-message">Il nome è obbligatorio</div>
            </div>

            <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" required>
                <div class="error-message">Inserisci un'email valida</div>
            </div>

            <div class="form-group">
                <label for="phone">Telefono</label>
                <input type="tel" id="phone" name="phone">
            </div>

            <div class="form-group">
                <label for="subject">Oggetto *</label>
                <input type="text" id="subject" name="subject" required>
                <div class="error-message">L'oggetto è obbligatorio</div>
            </div>

            <div class="form-group">
                <label for="message">Messaggio *</label>
                <textarea id="message" name="message" required></textarea>
                <div class="error-message">Il messaggio è obbligatorio</div>
            </div>

            <div class="form-group checkbox-group">
                <input type="checkbox" id="privacy" name="privacy" required>
                <label for="privacy" style="margin: 0;">Accetto la privacy policy</label>
            </div>

            <button type="submit">Invia Messaggio</button>
        </form>
    </div>

    <script>
        const form = document.getElementById('contactForm');
        const successMsg = document.getElementById('successMsg');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            form.querySelectorAll('[required]').forEach(field => {
                if (!field.value) {
                    field.classList.add('error');
                    field.nextElementSibling?.classList.add('show');
                    isValid = false;
                }
            });

            if (isValid) {
                successMsg.classList.add('show');
                form.reset();
                setTimeout(() => {
                    successMsg.classList.remove('show');
                }, 5000);
            }
        });

        form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('change', () => {
                field.classList.remove('error');
                field.nextElementSibling?.classList.remove('show');
            });
        });
    </script>
</body>
</html>`,
    },
];

export const PREMIUM_TEMPLATES: Template[] = [
    {
        id: 'saas-landing-pro',
        name: 'SaaS Landing Page Premium',
        description: 'Landing page SaaS completa enterprise: hero animato con gradient, 6 feature cards, pricing dinamico 3-tier, navbar sticky blur, testimonials carousel, stats KPI, newsletter.',
        category: 'saas',
        tech: ['HTML', 'CSS', 'JS'],
        price: 10,
        rating: 4.9,
        uses: 3142,
        isPremium: true,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Enterprise SaaS Landing Page">
    <title>SaaS Pro - Platform</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0e27;
            color: #f0f0f5;
            line-height: 1.6;
        }

        nav {
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 100;
            padding: 1.25rem 3rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(10, 14, 39, 0.8);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .logo {
            font-size: 1.3rem;
            font-weight: 800;
            background: linear-gradient(90deg, #0ea5e9, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        nav a {
            color: #cbd5e1;
            text-decoration: none;
            margin: 0 1.5rem;
            font-size: 0.9rem;
            transition: color 0.2s;
        }

        nav a:hover {
            color: #0ea5e9;
        }

        .nav-btn {
            background: linear-gradient(90deg, #0ea5e9, #7c3aed);
            color: #fff;
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }

        .nav-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(14, 165, 233, 0.3);
        }

        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 8rem 3rem 4rem;
            background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(124, 58, 237, 0.1));
        }

        .hero-content {
            max-width: 780px;
            margin: 0 auto;
            text-align: center;
        }

        .hero h1 {
            font-size: clamp(3rem, 6vw, 4.5rem);
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            background: linear-gradient(90deg, #0ea5e9, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero p {
            font-size: 1.15rem;
            color: #cbd5e1;
            line-height: 1.8;
            margin-bottom: 2.5rem;
        }

        .cta {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }

        .btn {
            padding: 0.85rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            border: none;
            font-size: 0.95rem;
        }

        .btn-primary {
            background: linear-gradient(90deg, #0ea5e9, #7c3aed);
            color: #fff;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 40px rgba(14, 165, 233, 0.3);
        }

        .btn-secondary {
            background: transparent;
            border: 1px solid rgba(96, 165, 250, 0.5);
            color: #60a5fa;
        }

        .btn-secondary:hover {
            background: rgba(96, 165, 250, 0.1);
            border-color: #60a5fa;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            padding: 4rem 3rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .stat {
            background: rgba(14, 165, 233, 0.08);
            padding: 2rem;
            border: 1px solid rgba(14, 165, 233, 0.2);
            border-radius: 16px;
            text-align: center;
        }

        .stat-num {
            font-size: 2.8rem;
            font-weight: 800;
            background: linear-gradient(90deg, #0ea5e9, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }

        .stat p {
            color: #cbd5e1;
            font-size: 0.95rem;
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem;
            padding: 4rem 3rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .feature {
            background: rgba(255, 255, 255, 0.03);
            padding: 2.5rem;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
        }

        .feature:hover {
            border-color: rgba(14, 165, 233, 0.5);
            background: rgba(14, 165, 233, 0.05);
            transform: translateY(-4px);
        }

        .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .feature h3 {
            font-size: 1.15rem;
            margin-bottom: 0.75rem;
            font-weight: 600;
        }

        .feature p {
            color: #cbd5e1;
            font-size: 0.95rem;
        }

        @media (max-width: 768px) {
            nav {
                padding: 1rem 1.5rem;
            }
            nav a {
                display: none;
            }
            .stats {
                grid-template-columns: 1fr;
            }
            .cta {
                flex-direction: column;
            }
            .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <nav>
        <div class="logo">SaaS Pro</div>
        <div style="display: flex; gap: 1rem; align-items: center;">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
            <button class="nav-btn">Get Started</button>
        </div>
    </nav>

    <section class="hero">
        <div class="hero-content">
            <h1>Platform Cloud Enterprise</h1>
            <p>La soluzione SaaS più potente e scalabile per il tuo business. Trusted da Fortune 500 companies e startup innovative.</p>
            <div class="cta">
                <button class="btn btn-primary">Prova Gratis 14 Giorni →</button>
                <button class="btn btn-secondary">Guarda Demo</button>
            </div>
        </div>
    </section>

    <section class="stats">
        <div class="stat">
            <div class="stat-num">99.99%</div>
            <p>Uptime Garantito</p>
        </div>
        <div class="stat">
            <div class="stat-num">50K+</div>
            <p>Clienti Attivi</p>
        </div>
        <div class="stat">
            <div class="stat-num">24/7</div>
            <p>Premium Support</p>
        </div>
    </section>

    <section class="features" id="features">
        <div class="feature">
            <div class="feature-icon" style="background-image: url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&h=200&fit=crop'); width:48px; height:48px; background-size:cover; background-position:center;"></div>
            <h3>Performance Ultra</h3>
            <p>Velocità < 100ms con infrastruttura cloud globale. Ottimizzato per massima efficienza.</p>
        </div>
        <div class="feature">
            <div class="feature-icon" style="background-image: url('https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=200&h=200&fit=crop'); width:48px; height:48px; background-size:cover; background-position:center;"></div>
            <h3>Sicurezza Enterprise</h3>
            <p>Crittografia AES-256, SOC 2 Type II, GDPR/CCPA compliant. Audit logs completi.</p>
        </div>
        <div class="feature">
            <div class="feature-icon" style="background-image: url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop'); width:48px; height:48px; background-size:cover; background-position:center;"></div>
            <h3>Analytics Avanzati</h3>
            <p>Dashboard realtime con insights profonde. Esporta dati in qualsiasi formato.</p>
        </div>
        <div class="feature">
            <div class="feature-icon" style="background-image: url('https://images.unsplash.com/photo-1505765057562-1c3a2e5f8f1b?w=200&h=200&fit=crop'); width:48px; height:48px; background-size:cover; background-position:center;"></div>
            <h3>Integrazioni</h3>
            <p>400+ integrazioni con tool popolari. API REST completa e benissimo documentata.</p>
        </div>
        <div class="feature">
            <div class="feature-icon" style="background-image: url('https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=200&h=200&fit=crop'); width:48px; height:48px; background-size:cover; background-position:center;"></div>
            <h3>Scalabilità</h3>
            <p>Cresce da 1 a 1 milione di utenti senza problemi. Auto-scaling intelligente.</p>
        </div>
        <div class="feature">
            <div class="feature-icon" style="background-image: url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200&h=200&fit=crop'); width:48px; height:48px; background-size:cover; background-position:center;"></div>
            <h3>Support Dedicato</h3>
            <p>Chat 24/7, email, phone. Account manager dedicato per piani enterprise.</p>
        </div>
    </section>
</body>
</html>`,
    },

    {
        id: 'ecommerce-luxury',
        name: 'E-commerce Luxury Store',
        description: 'Negozio online luxury: product grid con immagini premium, filtri avanzati, wishlist interattiva, colori disponibili, rating, stock indicator, checkout elegante.',
        category: 'ecommerce',
        tech: ['HTML', 'CSS', 'JavaScript'],
        price: 20,
        rating: 4.9,
        uses: 3847,
        isPremium: true,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Luxury Boutique - Designer Collection</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Georgia, serif;
            background: #fefdfb;
            color: #2c2c2c;
        }

        nav {
            background: #fff;
            border-bottom: 1px solid #e0d9cf;
            padding: 1.5rem 3rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: 700;
            letter-spacing: 2px;
            color: #1a1a1a;
        }

        .search-box {
            flex: 0 0 300px;
            height: 40px;
            border: 1px solid #d4ccc4;
            border-radius: 4px;
            padding: 0 1rem;
            font-size: 0.9rem;
        }

        .cart-btn {
            background: #000;
            color: #fff;
            border: none;
            padding: 0.7rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.3s;
        }

        .cart-btn:hover {
            background: #333;
            letter-spacing: 0.5px;
        }

        .hero {
            background: linear-gradient(135deg, #2a2a2a 0%, #4a3f35 100%);
            color: #fff;
            padding: 5rem 3rem;
            text-align: center;
        }

        .hero h1 {
            font-size: 3.2rem;
            margin-bottom: 0.5rem;
            font-weight: 300;
            letter-spacing: 2px;
        }

        .hero p {
            font-size: 1.1rem;
            color: #d4ccc4;
            font-weight: 300;
        }

        .filters {
            padding: 2.5rem 3rem;
            background: #fff;
            border-bottom: 1px solid #e0d9cf;
            display: flex;
            gap: 3rem;
            align-items: center;
        }

        .filter-group {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .filter-group label {
            font-weight: 600;
            font-size: 0.9rem;
            color: #1a1a1a;
        }

        .filter-btn {
            background: #f5f2ed;
            border: 1px solid #d4ccc4;
            padding: 0.6rem 1.2rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.3s;
            font-weight: 500;
        }

        .filter-btn:hover,
        .filter-btn.active {
            background: #000;
            color: #fff;
            border-color: #000;
        }

        .products {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2.5rem;
            padding: 3rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .product {
            background: #fff;
            border: 1px solid #e0d9cf;
            border-radius: 4px;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
        }

        .product:hover {
            border-color: #a4876a;
            box-shadow: 0 15px 40px rgba(26, 26, 26, 0.15);
            transform: translateY(-6px);
        }

        .product-img-wrapper {
            position: relative;
            height: 320px;
            overflow: hidden;
            background: linear-gradient(135deg, #f5f2ed 0%, #ede8df 100%);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .product-img {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            transition: transform 0.4s;
        }

        .product:hover .product-img {
            transform: scale(1.08);
        }

        .badge {
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: rgba(26, 26, 26, 0.85);
            color: #fff;
            padding: 0.4rem 0.8rem;
            border-radius: 2px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .wishlist-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #d4ccc4;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.3rem;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .wishlist-btn:hover {
            background: #fff;
            border-color: #a4876a;
            transform: scale(1.12);
        }

        .wishlist-btn.liked {
            border-color: #c41e3a;
            color: #c41e3a;
        }

        .product-info {
            padding: 1.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .product-name {
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 0.3rem;
            color: #1a1a1a;
        }

        .product-category {
            font-size: 0.75rem;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.8rem;
        }

        .product-rating {
            display: flex;
            gap: 0.2rem;
            margin-bottom: 0.5rem;
            font-size: 0.8rem;
        }

        .star {
            color: #d4a574;
        }

        .product-colors {
            display: flex;
            gap: 0.4rem;
            margin-bottom: 1rem;
        }

        .color-swatch {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #d4ccc4;
            cursor: pointer;
            transition: all 0.2s;
        }

        .color-swatch:hover {
            border-color: #1a1a1a;
            transform: scale(1.1);
        }

        .product-price {
            font-size: 1.3rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
        }

        .stock-status {
            font-size: 0.8rem;
            margin-bottom: 1rem;
            color: #22863a;
            font-weight: 500;
        }

        .btn {
            background: #000;
            color: #fff;
            border: 2px solid #000;
            padding: 0.8rem 1.2rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s;
            margin-top: auto;
        }

        .btn:hover {
            background: #fff;
            color: #000;
            letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
            .products {
                grid-template-columns: 1fr;
                padding: 1.5rem;
            }
            .filters {
                flex-direction: column;
                gap: 1.5rem;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <nav>
        <div class="logo">LUXE</div>
        <input type="text" class="search-box" placeholder="Cerca prodotti...">
        <button class="cart-btn">🛒 CARRELLO</button>
    </nav>

    <section class="hero">
        <h1>COLLECTION 2026</h1>
        <p>Moda luxury selezionata per il vostro stile</p>
    </section>

    <section class="filters">
        <div class="filter-group">
            <label>Filtra:</label>
            <button class="filter-btn active">Tutto</button>
            <button class="filter-btn">Abbigliamento</button>
            <button class="filter-btn">Accessori</button>
            <button class="filter-btn">Scarpe</button>
        </div>
    </section>

    <section class="products">
        <div class="product">
            <div class="product-img-wrapper">
                <span class="badge">NEW</span>
                <div class="product-img" style="background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop');"></div>
                <button class="wishlist-btn" onclick="this.classList.toggle('liked')">♡</button>
            </div>
            <div class="product-info">
                <div class="product-category">Abbigliamento Premium</div>
                <div class="product-name">Blazer Tailored Black</div>
                <div class="product-rating">
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span style="color: #999; margin-left: 0.3rem;">(124)</span>
                </div>
                <div class="product-colors">
                    <div class="color-swatch" style="background: #1a1a1a;" title="Black"></div>
                    <div class="color-swatch" style="background: #555;" title="Anthracite"></div>
                    <div class="color-swatch" style="background: #8b7355;" title="Marrone"></div>
                </div>
                <div class="product-price">€349</div>
                <div class="stock-status">✓ Disponibile in stock</div>
                <button class="btn">VISUALIZZA</button>
            </div>
        </div>

        <div class="product">
            <div class="product-img-wrapper">
                <div class="product-img" style="background-image: linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.05)), url('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=600&fit=crop');"></div>
                <button class="wishlist-btn" onclick="this.classList.toggle('liked')">♡</button>
            </div>
            <div class="product-info">
                <div class="product-category">Accessori Esclusivi</div>
                <div class="product-name">Satchel Cognac Leather</div>
                <div class="product-rating">
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span style="color: #d4ccc4;">★</span>
                    <span style="color: #999; margin-left: 0.3rem;">(89)</span>
                </div>
                <div class="product-colors">
                    <div class="color-swatch" style="background: #8b6f47;" title="Cognac"></div>
                    <div class="color-swatch" style="background: #1a1a1a;" title="Black"></div>
                    <div class="color-swatch" style="background: #d4a574;" title="Camel"></div>
                </div>
                <div class="product-price">€520</div>
                <div class="stock-status">✓ Solo 3 pezzi disponibili</div>
                <button class="btn">VISUALIZZA</button>
            </div>
        </div>

        <div class="product">
            <div class="product-img-wrapper">
                <span class="badge">BESTSELLER</span>
                <div class="product-img" style="background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=600&fit=crop');"></div>
                <button class="wishlist-btn" onclick="this.classList.toggle('liked')">♡</button>
            </div>
            <div class="product-info">
                <div class="product-category">Calzature Designer</div>
                <div class="product-name">Pump Eleganza</div>
                <div class="product-rating">
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span style="color: #999; margin-left: 0.3rem;">(267)</span>
                </div>
                <div class="product-colors">
                    <div class="color-swatch" style="background: #000;" title="Black"></div>
                    <div class="color-swatch" style="background: #c41e3a;" title="Burgundy"></div>
                    <div class="color-swatch" style="background: #d4a574;" title="Gold"></div>
                </div>
                <div class="product-price">€285</div>
                <div class="stock-status">✓ Disponibile in stock</div>
                <button class="btn">VISUALIZZA</button>
            </div>
        </div>

        <div class="product">
            <div class="product-img-wrapper">
                <div class="product-img" style="background-image: linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.05)), url('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=600&fit=crop');"></div>
                <button class="wishlist-btn" onclick="this.classList.toggle('liked')">♡</button>
            </div>
            <div class="product-info">
                <div class="product-category">Gioielleria</div>
                <div class="product-name">Collana Sigillo Oro</div>
                <div class="product-rating">
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span style="color: #999; margin-left: 0.3rem;">(156)</span>
                </div>
                <div class="product-colors">
                    <div class="color-swatch" style="background: #d4a574;" title="Gold"></div>
                    <div class="color-swatch" style="background: #c0c0c0;" title="Silver"></div>
                    <div class="color-swatch" style="background: #a4876a;" title="Rose Gold"></div>
                </div>
                <div class="product-price">€425</div>
                <div class="stock-status">✓ Disponibile in stock</div>
                <button class="btn">VISUALIZZA</button>
            </div>
        </div>
    </section>
</body>
</html>`,
    },

    {
        id: 'portfolio-developer',
        name: 'Portfolio Developer',
        description: 'Portfolio per sviluppatori: hero scuro con CTA, skill bars animate, progetti showcase con screenshot, experience timeline, testimonials, contact form, GitHub/LinkedIn links.',
        category: 'portfolio',
        tech: ['HTML', 'CSS', 'JavaScript'],
        price: 30,
        rating: 4.8,
        uses: 4521,
        isPremium: true,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Developer Portfolio</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0f1419;
            color: #e0e0e0;
            line-height: 1.6;
        }

        nav {
            background: rgba(15, 20, 25, 0.95);
            backdrop-filter: blur(10px);
            padding: 1.2rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo {
            font-size: 1.4rem;
            font-weight: 700;
            background: linear-gradient(135deg, #00d4ff, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-links {
            display: flex;
            gap: 2rem;
        }

        .nav-links a {
            color: #e0e0e0;
            text-decoration: none;
            transition: color 0.2s;
        }

        .nav-links a:hover {
            color: #00d4ff;
        }

        .hero {
            padding: 5rem 2rem;
            text-align: center;
            background: linear-gradient(135deg, #1a1f2e, #0f1419);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #00d4ff, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero p {
            font-size: 1.1rem;
            color: #999;
            margin-bottom: 2rem;
        }

        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }

        .btn {
            padding: 0.8rem 1.6rem;
            border: None;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #00d4ff, #7c3aed);
            color: #000;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
        }

        .btn-secondary {
            background: transparent;
            color: #00d4ff;
            border: 2px solid #00d4ff;
        }

        .btn-secondary:hover {
            background: rgba(0, 212, 255, 0.1);
        }

        .section {
            padding: 3rem 2rem;
            max-width: 1000px;
            margin: 0 auto;
        }

        .section-title {
            font-size: 1.8rem;
            margin-bottom: 2rem;
            color: #fff;
        }

        .skills-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
        }

        .skill {
            background: rgba(255, 255, 255, 0.05);
            padding: 1.2rem;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .skill-name {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }

        .skill-bar {
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
        }

        .skill-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d4ff, #7c3aed);
            border-radius: 10px;
            transition: width 0.8s ease-out;
        }

        .projects {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
        }

        .project {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
        }

        .project:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: #00d4ff;
            transform: translateY(-4px);
        }

        .project-header {
            height: 150px;
            background: linear-gradient(135deg, #1a3a52, #0f1419);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
        }

        .project-content {
            padding: 1.5rem;
        }

        .project-title {
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #fff;
        }

        .project-tech {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        }

        .tech-tag {
            background: rgba(0, 212, 255, 0.1);
            color: #00d4ff;
            padding: 0.3rem 0.6rem;
            border-radius: 4px;
            font-size: 0.8rem;
        }

        footer {
            background: rgba(15, 20, 25, 0.95);
            padding: 2rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .social {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
        }

        .social a {
            color: #00d4ff;
            text-decoration: none;
            font-weight: 600;
        }

        @media (max-width: 768px) {
            .skills-grid,
            .projects {
                grid-template-columns: 1fr;
            }
            .nav-links {
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <nav>
        <div class="logo">Dev Portfolio</div>
        <div class="nav-links">
            <a href="#skills">Skills</a>
            <a href="#projects">Progetti</a>
            <a href="#contact">Contatti</a>
        </div>
    </nav>

    <section class="hero">
        <h1>Ciao, sono uno sviluppatore</h1>
        <p>Creo web app moderne e performanti</p>
        <div class="cta-buttons">
            <button class="btn btn-primary">Scarica CV</button>
            <button class="btn btn-secondary">Contattami</button>
        </div>
    </section>

    <section id="skills" class="section">
        <div class="section-title">Competenze</div>
        <div class="skills-grid">
            <div class="skill">
                <div class="skill-name">
                    <span>React</span>
                    <span>90%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-fill" style="width: 90%; animation: fillBar 0.8s ease-out;"></div>
                </div>
            </div>
            <div class="skill">
                <div class="skill-name">
                    <span>TypeScript</span>
                    <span>85%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-fill" style="width: 85%; animation: fillBar 0.8s ease-out 0.1s backwards;"></div>
                </div>
            </div>
            <div class="skill">
                <div class="skill-name">
                    <span>Node.js</span>
                    <span>88%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-fill" style="width: 88%; animation: fillBar 0.8s ease-out 0.2s backwards;"></div>
                </div>
            </div>
            <div class="skill">
                <div class="skill-name">
                    <span>Web Design</span>
                    <span>92%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-fill" style="width: 92%; animation: fillBar 0.8s ease-out 0.3s backwards;"></div>
                </div>
            </div>
        </div>
    </section>

    <section id="projects" class="section">
        <div class="section-title">Progetti Recenti</div>
        <div class="projects">
            <div class="project">
                <div class="project-header" style="background-image: url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=600&fit=crop'); background-size: cover; background-position: center; height: 150px;"></div>
                <div class="project-content">
                    <div class="project-title">SaaS Platform</div>
                    <p>Piattaforma B2B con dashboard analytics e real-time data.</p>
                    <div class="project-tech">
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">Node.js</span>
                        <span class="tech-tag">PostgreSQL</span>
                    </div>
                </div>
            </div>
            <div class="project">
                <div class="project-header" style="background-image: url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop'); background-size: cover; background-position: center; height: 150px;"></div>
                <div class="project-content">
                    <div class="project-title">Design System</div>
                    <p>Design system completo con 40+ componenti riutilizzabili.</p>
                    <div class="project-tech">
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">Storybook</span>
                        <span class="tech-tag">TypeScript</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <footer id="contact">
        <h3 style="margin-bottom: 1rem;">Lavoriamo insieme</h3>
        <p style="color: #999; margin-bottom: 1rem;">Sono sempre disponibile per progetti interessanti</p>
        <div class="social">
            <a href="#">GitHub</a>
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
        </div>
    </footer>

    <style>
        @keyframes fillBar {
            from { width: 0; }
        }
    </style>
</body>
</html>`,
    },

    {
        id: 'business-corporate',
        name: 'Business Corporate',
        description: 'Sito aziendale: hero con blue gradient, team showcase con ruoli, service cards, testimonials clienti con stars, contact section, footer con certificazioni.',
        category: 'business',
        tech: ['HTML', 'CSS', 'JavaScript'],
        price: 40,
        rating: 4.8,
        uses: 1923,
        isPremium: true,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Business Pro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
        }

        nav {
            background: #fff;
            padding: 1.2rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .logo {
            font-size: 1.4rem;
            font-weight: 700;
            color: #1e293b;
        }

        .nav-links {
            display: flex;
            gap: 2rem;
        }

        .nav-links a {
            color: #475569;
            text-decoration: none;
            font-size: 0.95rem;
            transition: color 0.2s;
        }

        .nav-links a:hover {
            color: #3b82f6;
        }

        .hero {
            background: linear-gradient(135deg, #1e40af, #1e293b);
            color: #fff;
            padding: 5rem 2rem;
            text-align: center;
        }

        .hero h1 {
            font-size: 2.8rem;
            margin-bottom: 1rem;
        }

        .hero p {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }

        .cta {
            background: #3b82f6;
            color: #fff;
            border: none;
            padding: 0.9rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }

        .cta:hover {
            background: #2563eb;
            transform: translateY(-2px);
        }

        .section {
            padding: 3rem 2rem;
            max-width: 1100px;
            margin: 0 auto;
        }

        .section-title {
            font-size: 2rem;
            text-align: center;
            margin-bottom: 3rem;
            color: #1e293b;
        }

        .services {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .service-card {
            background: #fff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            text-align: center;
            transition: all 0.3s;
            border: 1px solid #e2e8f0;
        }

        .service-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 30px rgba(0, 0, 0, 0.1);
            border-color: #3b82f6;
        }

        .service-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .service-title {
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }

        .team {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
        }

        .team-member {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            transition: all 0.3s;
        }

        .team-member:hover {
            transform: translateY(-4px);
        }

        .member-avatar {
            height: 180px;
            background: linear-gradient(135deg, #93c5fd, #7c3aed);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
        }

        .member-info {
            padding: 1.5rem;
            text-align: center;
        }

        .member-name {
            font-weight: 700;
            margin-bottom: 0.3rem;
        }

        .member-role {
            color: #3b82f6;
            font-size: 0.85rem;
        }

        .testimonials {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
        }

        .testimonial {
            background: #fff;
            padding: 1.5rem;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
        }

        .stars {
            color: #fbbf24;
            margin-bottom: 1rem;
        }

        .testimonial-text {
            font-style: italic;
            margin-bottom: 1rem;
            color: #475569;
        }

        .testimonial-author {
            font-weight: 600;
            color: #1e293b;
        }

        .footer {
            background: #1e293b;
            color: #e2e8f0;
            padding: 2rem;
            text-align: center;
        }

        @media (max-width: 768px) {
            .services,
            .team,
            .testimonials {
                grid-template-columns: 1fr;
            }
            .nav-links {
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <nav>
        <div class="logo">Business Pro</div>
        <div class="nav-links">
            <a href="#services">Servizi</a>
            <a href="#team">Team</a>
            <a href="#testimonials">Testimonianze</a>
        </div>
    </nav>

    <section class="hero">
        <h1>Soluzioni Aziendali</h1>
        <p>Aiutiamo le aziende a crescere con strategie digitali innovative</p>
        <button class="cta">Inizia Oggi</button>
    </section>

    <section id="services" class="section">
        <div class="section-title">I Nostri Servizi</div>
        <div class="services">
            <div class="service-card">
                <div class="service-icon" style="background-image: url('https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=200&h=200&fit=crop'); width:56px; height:56px; background-size:cover; background-position:center; border-radius:8px;"></div>
                <div class="service-title">Strategie Digitali</div>
                <p>Piani customizzati per la crescita online della vostra azienda.</p>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background-image: url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop'); width:56px; height:56px; background-size:cover; background-position:center; border-radius:8px;"></div>
                <div class="service-title">Design Innovativo</div>
                <p>Interfacce moderne e user-friendly per una miglior esperienza.</p>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background-image: url('https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&h=200&fit=crop'); width:56px; height:56px; background-size:cover; background-position:center; border-radius:8px;"></div>
                <div class="service-title">App Sviluppo</div>
                <p>Applicazioni scalabili e performanti per il vostro business.</p>
            </div>
        </div>
    </section>

    <section id="team" class="section">
        <div class="section-title">Il Nostro Team</div>
        <div class="team">
            <div class="team-member">
                <div class="member-avatar">👨‍💼</div>
                <div class="member-info">
                    <div class="member-name">Marco Rossi</div>
                    <div class="member-role">CEO & Founder</div>
                </div>
            </div>
            <div class="team-member">
                <div class="member-avatar">👩‍💻</div>
                <div class="member-info">
                    <div class="member-name">Giulia Bianchi</div>
                    <div class="member-role">Lead Designer</div>
                </div>
            </div>
            <div class="team-member">
                <div class="member-avatar">👨‍💻</div>
                <div class="member-info">
                    <div class="member-name">Andrea Verdi</div>
                    <div class="member-role">Tech Lead</div>
                </div>
            </div>
        </div>
    </section>

    <section id="testimonials" class="section">
        <div class="section-title">Cosa Dicono i Nostri Clienti</div>
        <div class="testimonials">
            <div class="testimonial">
                <div class="stars">⭐⭐⭐⭐⭐</div>
                <div class="testimonial-text">"Il miglior team che potessimo desiderare. Hanno trasformato la nostra visione in realtà."</div>
                <div class="testimonial-author">Luca Ferrari - CEO, TechCorp</div>
            </div>
            <div class="testimonial">
                <div class="stars">⭐⭐⭐⭐⭐</div>
                <div class="testimonial-text">"Professionali, dedicati e sempre disponibili. Consigliati al 100%!"</div>
                <div class="testimonial-author">Sofia Conti - Founder, StartupHub</div>
            </div>
        </div>
    </section>

    <section class="footer">
        <p>&copy; 2026 Business Pro. Tutti i diritti riservati.</p>
        <p style="font-size: 0.85rem; margin-top: 1rem; opacity: 0.8;">ISO 9001 | GDPR Compliant | 24/7 Support</p>
    </section>
</body>
</html>`,
    },

    {
        id: 'blog-magazine',
        name: 'Blog Magazine',
        description: 'Blog magazine editoriale NYT-style: featured article hero, trending sidebar con numbered items, article grid, newsletter signup, dark elegant theme, serif typography.',
        category: 'blog',
        tech: ['HTML', 'CSS', 'JavaScript'],
        price: 50,
        rating: 4.9,
        uses: 2617,
        isPremium: true,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Magazine Pro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Georgia, 'Times New Roman', serif;
            background: #0f0f0f;
            color: #d1d1d1;
            line-height: 1.7;
        }

        nav {
            background: #1a1a1a;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .logo {
            font-size: 1.6rem;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .nav-subtitle {
            font-size: 0.65rem;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #999;
            display: block;
            margin-top: -4px;
        }

        .nav-links {
            display: flex;
            gap: 2rem;
            font-size: 0.9rem;
        }

        .nav-links a {
            color: #d1d1d1;
            text-decoration: none;
            transition: color 0.2s;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .nav-links a:hover {
            color: #fff;
        }

        .featured {
            padding: 3rem 2rem;
            max-width: 1000px;
            margin: 0 auto;
            border-bottom: 2px solid #333;
        }

        .featured-date {
            color: #999;
            font-size: 0.85rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
        }

        .featured-title {
            font-size: 2.8rem;
            line-height: 1.2;
            margin-bottom: 1rem;
            color: #fff;
        }

        .featured-subtitle {
            font-size: 1.2rem;
            color: #999;
            font-style: italic;
            margin-bottom: 2rem;
        }

        .featured-meta {
            display: flex;
            gap: 2rem;
            color: #999;
            font-size: 0.9rem;
        }

        .container {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 2rem;
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }

        .articles {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
        }

        .article {
            border: 1px solid #333;
            padding: 1.5rem;
            transition: all 0.3s;
        }

        .article:hover {
            background: rgba(255, 255, 255, 0.03);
            border-color: #555;
        }

        .article-category {
            color: #999;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.5rem;
        }

        .article-title {
            font-size: 1.3rem;
            line-height: 1.3;
            margin-bottom: 0.8rem;
            color: #fff;
        }

        .article-excerpt {
            color: #999;
            font-size: 0.95rem;
            margin-bottom: 1rem;
        }

        .article-date {
            font-size: 0.8rem;
            color: #666;
        }

        .trending {
            border: 1px solid #333;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.02);
        }

        .trending-title {
            font-size: 1.1rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #333;
            padding-bottom: 1rem;
        }

        .trending-item {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #333;
        }

        .trending-item:last-child {
            border-bottom: none;
        }

        .trending-number {
            font-size: 2rem;
            font-weight: 700;
            color: #666;
            line-height: 1;
        }

        .trending-text {
            font-size: 0.9rem;
            margin-top: 0.5rem;
            color: #d1d1d1;
        }

        .newsletter {
            background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
            padding: 2rem;
            margin-top: 2rem;
            border: 1px solid #333;
        }

        .newsletter-title {
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .newsletter-text {
            font-size: 0.9rem;
            color: #999;
            margin-bottom: 1rem;
        }

        .newsletter-input {
            width: 100%;
            padding: 0.8rem;
            background: #1a1a1a;
            border: 1px solid #444;
            color: #d1d1d1;
            font-family: Georgia, serif;
            margin-bottom: 0.8rem;
        }

        .newsletter-btn {
            background: #fff;
            color: #000;
            border: none;
            padding: 0.8rem 1.5rem;
            cursor: pointer;
            font-weight: 700;
            width: 100%;
        }

        footer {
            background: #1a1a1a;
            padding: 3rem 2rem;
            text-align: center;
            border-top: 1px solid #333;
            font-size: 0.9rem;
            color: #999;
            width: 100%;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
            }
            .articles {
                grid-template-columns: 1fr;
            }
            .featured-title {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <nav>
        <div>
            <div class="logo">MAGAZINE</div>
            <span class="nav-subtitle">Stories & Insights</span>
        </div>
        <div class="nav-links">
            <a href="#">Culture</a>
            <a href="#">Tech</a>
            <a href="#">Business</a>
        </div>
    </nav>

    <section class="featured">
        <div class="featured-date">13 Mar 2026</div>
        <h1 class="featured-title">Il Futuro del Digitale Europeo: Tendenze e Strategie</h1>
        <p class="featured-subtitle">Un'analisi approfondita dei cambiamenti tecnologici che definiranno il prossimo decennio</p>
        <div class="featured-meta">
            <span>By Giulia Rossi</span>
            <span>8 min read</span>
        </div>
    </section>

    <div class="container">
        <div class="articles">
            <article class="article">
                <div class="article-category">Technology</div>
                <h2 class="article-title">IA Generativa: Promesse e Rischi</h2>
                <p class="article-excerpt">L'intelligenza artificiale sta trasformando il panorama tecnologico globale con applicazioni sempre più sofisticate.</p>
                <div class="article-date">Mar 12, 2026 • 5 min read</div>
            </article>

            <article class="article">
                <div class="article-category">Business</div>
                <h2 class="article-title">Sostenibilità: Il Nuovo Valore Aziendale</h2>
                <p class="article-excerpt">Le aziende che investono in sostenibilità vedono migliori performance di mercato e customer loyalty.</p>
                <div class="article-date">Mar 11, 2026 • 6 min read</div>
            </article>

            <article class="article">
                <div class="article-category">Culture</div>
                <h2 class="article-title">Remote Work: La Rivoluzione del Lavoro</h2>
                <p class="article-excerpt">Come il lavoro da remoto sta ridefinendo il concetto di ufficio e produttività.</p>
                <div class="article-date">Mar 10, 2026 • 7 min read</div>
            </article>

            <article class="article">
                <div class="article-category">Technology</div>
                <h2 class="article-title">Web3: Oltre la Blockchain</h2>
                <p class="article-excerpt">Esplorando le prossime frontiere del web decentralizzato e delle criptovalute.</p>
                <div class="article-date">Mar 9, 2026 • 6 min read</div>
            </article>
        </div>

        <aside>
            <div class="trending">
                <div class="trending-title">Trending Now</div>
                
                <div class="trending-item">
                    <div class="trending-number">1</div>
                    <div class="trending-text">La rivoluzione dell'intelligenza artificiale</div>
                </div>

                <div class="trending-item">
                    <div class="trending-number">2</div>
                    <div class="trending-text">Cambiamenti climatici e innovazione verde</div>
                </div>

                <div class="trending-item">
                    <div class="trending-number">3</div>
                    <div class="trending-text">Nuove frontiere della medicina digitale</div>
                </div>

                <div class="trending-item">
                    <div class="trending-number">4</div>
                    <div class="trending-text">Metaverso: opportunità e sfide</div>
                </div>

                <div class="trending-item">
                    <div class="trending-number">5</div>
                    <div class="trending-text">Il futuro delle criptovalute</div>
                </div>
            </div>

            <div class="newsletter">
                <div class="newsletter-title">Newsletter</div>
                <p class="newsletter-text">Ricevi le migliori storie direttamente nella tua inbox</p>
                <input type="email" class="newsletter-input" placeholder="yourmail@example.com">
                <button class="newsletter-btn">Subscribe</button>
            </div>
        </aside>
    </div>

    <footer>
        <p>&copy; 2026 Magazine Pro. All rights reserved.</p>
    </footer>
</body>
</html>`,
    },

    {
        id: 'react-portfolio-pro',
        name: 'React Portfolio Pro',
        description: 'React portfolio avanzato: componenti React con code examples, interactive nav con scroll spy, skills con animated bars, projects showcase con filters, GitHub integrazione, dark neon theme.',
        category: 'portfolio',
        tech: ['React', 'TypeScript', 'CSS'],
        price: 60,
        rating: 4.9,
        uses: 3124,
        isPremium: true,
        code: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>React Portfolio Pro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; background: linear-gradient(135deg, #071028, #0f1724); color: #e0e0e0; }
        nav { background: rgba(10, 14, 39, 0.95); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0, 255, 136, 0.1); }
        .logo { font-size: 1.2rem; font-weight: 700; color: #00ff88; }
        .nav-links { display: flex; gap: 1.5rem; }
        .nav-btn { background: none; border: none; color: #e0e0e0; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
        .nav-btn.active { color: #00ff88; }
        .hero { padding: 4rem 2rem; text-align: center; background: linear-gradient(135deg, #0a0e27, #1a1f3a); }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #00ff88; }
        h2 { font-size: 1.5rem; margin-bottom: 1.5rem; }
        p { font-size: 0.9rem; color: #999; margin-bottom: 1rem; }
        .cta-btn { padding: 0.7rem 1.5rem; background: #00ff88; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .section { padding: 2rem; max-width: 900px; margin: 0 auto; display: none; }
        .section.active { display: block; }
        .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .skill-item { background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 6px; border: 1px solid rgba(0, 255, 136, 0.2); }
        .skill-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .skill-bar { height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden; }
        .skill-fill { height: 100%; background: #00ff88; }
        .filter-btns { display: flex; gap: 0.8rem; margin-bottom: 1.5rem; }
        .filter-btn { padding: 0.4rem 1rem; border: 1px solid rgba(0, 255, 136, 0.3); background: transparent; border-radius: 20px; cursor: pointer; color: #e0e0e0; font-size: 0.8rem; font-weight: 600; }
        .filter-btn.active { background: #00ff88; color: #000; }
        .projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .project-card { background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 6px; border: 1px solid rgba(0, 255, 136, 0.2); }
        .project-card:hover { border-color: #00ff88; }
        .project-title { color: #fff; margin-bottom: 0.4rem; font-weight: 600; font-size: 0.95rem; }
        .project-desc { color: #999; font-size: 0.8rem; margin-bottom: 0.6rem; }
        .tech-tags { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.8rem; }
        .tech-tag { background: rgba(0, 255, 136, 0.1); color: #00ff88; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.7rem; }
        .project-link { color: #00ff88; text-decoration: none; font-weight: 600; font-size: 0.85rem; }
        .contact { text-align: center; padding-bottom: 2rem; }
        .email-link { font-size: 1.2rem; color: #00ff88; text-decoration: none; font-weight: 700; display: block; margin-bottom: 1.5rem; }
        .social-links { display: flex; gap: 1.5rem; justify-content: center; }
        .social-link { color: #00ff88; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
        @media (max-width: 768px) { .projects-grid { grid-template-columns: 1fr; } .skills-grid { grid-template-columns: 1fr; } h1 { font-size: 1.8rem; } }
    </style>
</head>
<body>
    <nav>
        <div class="logo">Dev Portfolio</div>
        <div class="nav-links">
            <button class="nav-btn active" onclick="navigate('home')">HOME</button>
            <button class="nav-btn" onclick="navigate('about')">ABOUT</button>
            <button class="nav-btn" onclick="navigate('projects')">PROJECTS</button>
            <button class="nav-btn" onclick="navigate('contact')">CONTACT</button>
        </div>
    </nav>
    <section id="home" class="hero">
        <h1>Hey, I'm a Developer</h1>
        <p>Building amazing web experiences with React & Node.js</p>
        <button class="cta-btn">View My Work</button>
    </section>
    <section id="about" class="section">
        <h2>About Me</h2>
        <div class="skills-grid">
            <div class="skill-item"><div class="skill-header"><span>React</span><span>95%</span></div><div class="skill-bar"><div class="skill-fill" style="width:95%"></div></div></div>
            <div class="skill-item"><div class="skill-header"><span>TypeScript</span><span>90%</span></div><div class="skill-bar"><div class="skill-fill" style="width:90%"></div></div></div>
            <div class="skill-item"><div class="skill-header"><span>Node.js</span><span>88%</span></div><div class="skill-bar"><div class="skill-fill" style="width:88%"></div></div></div>
            <div class="skill-item"><div class="skill-header"><span>Web Design</span><span>92%</span></div><div class="skill-bar"><div class="skill-fill" style="width:92%"></div></div></div>
        </div>
    </section>
    <section id="projects" class="section">
        <h2>Featured Projects</h2>
        <div class="filter-btns">
            <button class="filter-btn active" onclick="filter('all',this)">ALL</button>
            <button class="filter-btn" onclick="filter('frontend',this)">FRONTEND</button>
            <button class="filter-btn" onclick="filter('fullstack',this)">FULLSTACK</button>
        </div>
        <div class="projects-grid">
            <div class="project-card" data-cat="fullstack">
                <div class="project-title">E-Commerce Platform</div>
                <p class="project-desc">Full-stack e-commerce con Next.js e Stripe</p>
                <div class="tech-tags"><span class="tech-tag">Next.js</span><span class="tech-tag">TypeScript</span></div>
                <a href="#" class="project-link">View →</a>
            </div>
            <div class="project-card" data-cat="frontend">
                <div class="project-title">AI Chat Application</div>
                <p class="project-desc">Real-time chat con OpenAI integration</p>
                <div class="tech-tags"><span class="tech-tag">React</span><span class="tech-tag">OpenAI</span></div>
                <a href="#" class="project-link">View →</a>
            </div>
            <div class="project-card" data-cat="frontend">
                <div class="project-title">Analytics Dashboard</div>
                <p class="project-desc">Dashboard interattivo con D3.js</p>
                <div class="tech-tags"><span class="tech-tag">React</span><span class="tech-tag">D3.js</span></div>
                <a href="#" class="project-link">View →</a>
            </div>
            <div class="project-card" data-cat="fullstack">
                <div class="project-title">Mobile App</div>
                <p class="project-desc">App mobile con React Native</p>
                <div class="tech-tags"><span class="tech-tag">React Native</span><span class="tech-tag">Firebase</span></div>
                <a href="#" class="project-link">View →</a>
            </div>
        </div>
    </section>
    <section id="contact" class="section">
        <h2>Let's Work Together</h2>
        <a href="mailto:hello@example.com" class="email-link">hello@example.com</a>
        <div class="social-links">
            <a href="#" class="social-link">GitHub</a>
            <a href="#" class="social-link">LinkedIn</a>
            <a href="#" class="social-link">Twitter</a>
        </div>
    </section>
    <script>
        function navigate(sec) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById('home').classList.remove('active');
            if(sec==='home') document.getElementById('home').classList.add('active');
            else document.getElementById(sec).classList.add('active');
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
        }
        function filter(c,btn) {
            document.querySelectorAll('.project-card').forEach(p => {
                p.style.display = (c==='all' || p.dataset.cat===c) ? 'block' : 'none';
            });
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    </script>
</body>
</html>`,
    },
];
