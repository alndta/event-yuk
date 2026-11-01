import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Yuk Multi-Role Ecosystem RESTful API',
      version: '1.0.0',
      description:
        'Dokumentasi resmi OpenAPI 3.0 untuk arsitektur backend Event Yuk. Melayani 6 pilar ekosistem (Event Organizer, Vendor Produksi, Musisi & Band, Tenant Bazaar, Sponsor Brand, dan Kru Lapangan) dengan modul OTP 6-Digit, RBAC Multi-Role, Rekening Bersama Escrow Midtrans, dan Digital PKS / MoU.',
      contact: {
        name: 'Tim Engineering Event Yuk',
        email: 'sundaairland@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001/api/v1',
        description: 'Development Server (Local)',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan Access Token JWT (format: Bearer <token>)',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operasi berhasil.' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Pesan kegagalan validasi atau otorisasi' },
            code: { type: 'string', example: 'UNAUTHORIZED' },
          },
        },
        SendOtpRequest: {
          type: 'object',
          required: ['identifier', 'type'],
          properties: {
            identifier: { type: 'string', example: 'sundaairland@gmail.com', description: 'Email atau nomor telepon WhatsApp' },
            type: { type: 'string', enum: ['EMAIL', 'WHATSAPP'], example: 'EMAIL' },
          },
        },
        VerifyOtpRequest: {
          type: 'object',
          required: ['identifier', 'otp_code', 'full_name', 'password', 'initial_role'],
          properties: {
            identifier: { type: 'string', example: 'sundaairland@gmail.com' },
            otp_code: { type: 'string', example: '729104', description: 'Kode OTP 6-digit' },
            full_name: { type: 'string', example: 'PT Kreasi Festival Nusantara' },
            password: { type: 'string', example: 'PasswordAman123!' },
            initial_role: { type: 'string', enum: ['EO', 'VENDOR', 'TALENT', 'TENANT', 'SPONSOR', 'CREW'], example: 'EO' },
            phone_wa: { type: 'string', example: '+6281234567890' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'eo@eventyuk.id' },
            password: { type: 'string', example: 'password123' },
          },
        },
        CreateEventRequest: {
          type: 'object',
          required: ['organizer_id', 'title', 'event_category', 'venue_name', 'start_date', 'end_date', 'total_budget'],
          properties: {
            organizer_id: { type: 'string', format: 'uuid', example: 'a0000000-0000-0000-0000-000000000001' },
            title: { type: 'string', example: 'Jakarta Soundscape Festival 2027' },
            event_category: { type: 'string', enum: ['CONCERT', 'PENSI', 'EXPO', 'BAZAAR'], example: 'CONCERT' },
            venue_name: { type: 'string', example: 'Plaza Parkir Timur Senayan' },
            start_date: { type: 'string', format: 'date', example: '2027-08-15' },
            end_date: { type: 'string', format: 'date', example: '2027-08-16' },
            total_budget: { type: 'number', example: 500000000 },
            description: { type: 'string', example: 'Festival musik multi-genre 2 hari dengan 2 panggung utama.' },
            allow_vendor_proposals: { type: 'boolean', example: true },
            allow_talent_proposals: { type: 'boolean', example: true },
            allow_tenant_registrations: { type: 'boolean', example: true },
            allow_crew_applications: { type: 'boolean', example: true },
            is_invite_only: { type: 'boolean', example: false },
          },
        },
        UploadPortfolioRequest: {
          type: 'object',
          required: ['organizer_id', 'title', 'event_category', 'venue_name', 'start_date', 'end_date'],
          properties: {
            organizer_id: { type: 'string', format: 'uuid', example: 'a0000000-0000-0000-0000-000000000001' },
            title: { type: 'string', example: 'Pensi SMA Labschool 2026' },
            event_category: { type: 'string', enum: ['CONCERT', 'PENSI', 'EXPO', 'BAZAAR'], example: 'PENSI' },
            venue_name: { type: 'string', example: 'Hall Basket Senayan' },
            start_date: { type: 'string', format: 'date', example: '2026-06-20' },
            end_date: { type: 'string', format: 'date', example: '2026-06-21' },
            attendee_count: { type: 'number', example: 6500 },
            total_budget: { type: 'number', example: 350000000 },
            aftermovie_url: { type: 'string', example: 'https://youtube.com/watch?v=sample' },
            banner_image: { type: 'string', example: '/assets/hero-concert.jpg' },
          },
        },
        CreateProposalRequest: {
          type: 'object',
          required: ['event_id', 'sender_id', 'receiver_id', 'proposal_type', 'deal_price', 'dp_percentage'],
          properties: {
            event_id: { type: 'string', format: 'uuid', example: 'b0000000-0000-0000-0000-000000000001' },
            sender_id: { type: 'string', format: 'uuid', example: 'a0000000-0000-0000-0000-000000000002' },
            receiver_id: { type: 'string', format: 'uuid', example: 'a0000000-0000-0000-0000-000000000001' },
            proposal_type: { type: 'string', enum: ['VENDOR', 'TALENT', 'SPONSOR', 'TENANT'], example: 'VENDOR' },
            deal_price: { type: 'number', example: 45000000 },
            dp_percentage: { type: 'number', example: 50, description: 'Rasio termin DP (e.g. 50 untuk 50:50, 70 untuk 70:30)' },
            scope_of_work: { type: 'string', example: 'Penyediaan Line Array 30.000W RMS dan panggung 12x10m' },
            notes: { type: 'string', example: 'Termasuk teknisi standby 24 jam' },
          },
        },
        CounterProposalRequest: {
          type: 'object',
          required: ['counter_price', 'counter_dp_percentage', 'counter_notes'],
          properties: {
            counter_price: { type: 'number', example: 40000000 },
            counter_dp_percentage: { type: 'number', example: 70, description: 'Skema termin baru (70:30)' },
            counter_notes: { type: 'string', example: 'Kami sepakat jika DP dinaikkan menjadi 70% untuk persiapan instalasi awal.' },
          },
        },
      },
    },
    paths: {
      '/auth/send-otp': {
        post: {
          tags: ['Autentikasi & Akun'],
          summary: 'Kirim Kode OTP 6-Digit (Email / WhatsApp)',
          description: 'Menerbitkan kode OTP numerik 6-digit dan mengirimkannya ke email Gmail via SMTP atau nomor WhatsApp.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SendOtpRequest' } } },
          },
          responses: {
            200: { description: 'OTP berhasil dikirim', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            400: { description: 'Validasi gagal' },
          },
        },
      },
      '/auth/verify-otp-register': {
        post: {
          tags: ['Autentikasi & Akun'],
          summary: 'Verifikasi OTP & Pendaftaran Akun Baru',
          description: 'Memvalidasi kode OTP 6-digit dan membuat akun pengguna serta dompet Escrow otomatis.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpRequest' } } },
          },
          responses: {
            201: { description: 'Pendaftaran sukses' },
            400: { description: 'Kode OTP tidak valid atau kedaluwarsa' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Autentikasi & Akun'],
          summary: 'Masuk Akun Pengguna (Email & Password)',
          description: 'Melakukan autentikasi kredensial pengguna dan mengembalikan token JWT serta daftar profil peran.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
          },
          responses: {
            200: { description: 'Login berhasil' },
            401: { description: 'Kredensial tidak valid' },
          },
        },
      },
      '/users/roles/switch': {
        post: {
          tags: ['Multi-Role RBAC'],
          summary: 'Beralih Profil Peran Pengguna Aktif',
          description: 'Mengaktifkan peran tertentu (EO, VENDOR, TALENT, TENANT, SPONSOR, CREW) tanpa login ulang.',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { target_role: { type: 'string', enum: ['EO', 'VENDOR', 'TALENT', 'TENANT', 'SPONSOR', 'CREW'] } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Peran berhasil dialihkan' },
          },
        },
      },
      '/events': {
        get: {
          tags: ['Proyek Acara (Workspace)'],
          summary: 'Dapatkan Seluruh Acara (Live & Portofolio)',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'is_portfolio', in: 'query', schema: { type: 'boolean' } },
          ],
          responses: {
            200: { description: 'Daftar acara berhasil diambil' },
          },
        },
        post: {
          tags: ['Proyek Acara (Workspace)'],
          summary: 'Buat Proyek Acara Baru (Khusus EO)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEventRequest' } } },
          },
          responses: {
            201: { description: 'Proyek acara berhasil dibuat' },
          },
        },
      },
      '/events/portfolio': {
        post: {
          tags: ['Proyek Acara (Workspace)'],
          summary: 'Unggah Rekam Jejak Acara Terdahulu (Katalog Portofolio EO)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadPortfolioRequest' } } },
          },
          responses: {
            201: { description: 'Portofolio berhasil ditambahkan ke katalog' },
          },
        },
      },
      '/proposals': {
        get: {
          tags: ['Proposal & Negosiasi'],
          summary: 'Ambil Daftar Proposal & Kesepakatan',
          responses: {
            200: { description: 'Daftar proposal berhasil didapatkan' },
          },
        },
        post: {
          tags: ['Proposal & Negosiasi'],
          summary: 'Kirim Proposal Baru (EO ke Mitra atau Mitra ke EO)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProposalRequest' } } },
          },
          responses: {
            201: { description: 'Proposal berhasil dikirim' },
          },
        },
      },
      '/proposals/{id}/counter': {
        post: {
          tags: ['Proposal & Negosiasi'],
          summary: 'Ajukan Perubahan Nilai & Skema Termin (Counter-Offer)',
          description: 'Menegosiasikan ulang harga dan rasio DP (e.g. 70:30 atau 50:50) sebelum persetujuan resmi.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CounterProposalRequest' } } },
          },
          responses: {
            200: { description: 'Penawaran balik berhasil diajukan' },
          },
        },
      },
      '/proposals/{id}/respond': {
        post: {
          tags: ['Proposal & Negosiasi'],
          summary: 'Setujui atau Tolak Proposal (Penerbitan PKS Digital)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['action'],
                  properties: {
                    action: { type: 'string', enum: ['ACCEPT', 'REJECT'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Status proposal diperbarui dan PKS diterbitkan jika diterima' },
          },
        },
      },
      '/proposals/sponsorship/packages': {
        get: {
          tags: ['Sponsor Intelligence Hub'],
          summary: 'Katalog Paket Sponsorship Aktif (Title, Platinum, Gold, Silver)',
          responses: {
            200: { description: 'Daftar paket sponsorship beserta hak aktivasi & benefit' },
          },
        },
      },
    },
  },
  apis: [], // All specs are defined explicitly above in OpenAPI 3.0 standard
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
