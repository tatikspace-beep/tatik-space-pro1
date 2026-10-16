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

export type TemplateMetadata = Omit<Template, "code">;

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
