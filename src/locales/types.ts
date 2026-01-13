export interface Translation {
    header: {
        features: string;
        portfolio: string;
        whyFramax: string;
        process: string;
        faq: string;
        getStarted: string;
        results: string;
        login: string;
        dashboard: string;
    };
    footer: {
        tagline: string;
        product: string;
        features: string;
        changelog: string;
        studio: string;
        about: string;
        blog: string;
        careers: string;
        legal: string;
        privacy: string;
        terms: string;
        rights: string;
    };
    cookie: {
        title: string;
        text: string;
        readLink: string;
        decline: string;
        accept: string;
    };
    hero: {
        badge: string;
        titlePre: string;
        titleHighlight: string;
        dynamicKeywords?: string[];
        description: string;
        startProject: string;
        viewWork: string;
        trustedBy: string;
        // New Hero Section
        title: string;
        subtitle: string;
        bookMeeting: string;
        couldBeYou: string;
        moreClients: string;
        alwaysOpen: string;
        alwaysOnline: string;
        growth: string;
        reviews: string;
        yourBusiness: string;
        yourWebsite: string;
        learnMore: string;
        reviewsCount: string;
        // Review names and texts
        review1Name: string;
        review1Text: string;
        review2Name: string;
        review2Text: string;
        review3Name: string;

        review3Text: string;
        // Visuals
        heroVisuals: {
            activeGrowth: string;
            recentActivity: string;
            revenueScale: string;
            trendingUp: string;
            scaleStatus: string;
        };
    };
    portfolio: {
        badge: string;
        title: string;
        titleHighlight: string;
        subtitle: string;
        comingSoon: string;
        startProject: string;
        // Project 1
        project1Title: string;
        project1Category: string;
        project1Description: string;
        // Project 2
        project2Title: string;
        project2Category: string;
        project2Description: string;
        // Project 3
        project3Title: string;
        project3Category: string;
        project3Description: string;
    };
    features: {
        title: string;
        titleHighlight: string;
        subtitle: string;
        speedTitle: string;
        speedDesc: string;
        seoTitle: string;
        seoDesc: string;
        automationTitle: string;
        automationDesc: string;
        websitesTitle: string;
        websitesDesc: string;
        systemsTitle: string;
        systemsDesc: string;
        codeTitle: string;
        codeDesc: string;
        mobileTitle: string;
        mobileDesc: string;
        globalTitle: string;
        globalDesc: string;
        // Notifications
        notificationLead: string;
        notificationInvoice: string;
        notificationMeeting: string;
        notificationEmail: string;
        timeNow: string;
        time2m: string;
        time15m: string;
        time2h: string;
        // Dashboard
        monthlyRevenue: string;
        newClients: string;
        // Other
        thisCouldBeYou: string;
        searchYourBusiness: string;
    };
    booking: {
        title: string;
        titleHighlight: string;
        subtitle: string;
        selectDate: string;
        selectTime: string;
        finalDetails: string;
        fullName: string;
        workEmail: string;
        projectNotes: string;
        projectNotesPlaceholder: string;
        confirmBooking: string;
        confirming: string;
        change: string;
        checkingAvailability: string;
        spotsLeft: string;
        spot: string;
        spots: string;
        timezoneNote: string;
        allSet: string;
        confirmationSent: string;
        lookForward: string;
        bookAnother: string;
        sun: string;
        mon: string;
        tue: string;
        wed: string;
        thu: string;
        fri: string;
        sat: string;
        // Days and Months
        months: string[];
        // Validation & Errors
        validationEmail: string;
        validationRealEmail: string;
        alertError: string;
    };
    techStack: {
        poweredBy: string;
    };
    legal: {
        lastUpdated: string;
        privacyTitle: string;
        termsTitle: string;
    };
    faqSection: {
        title: string;
        subtitle: string;
        questions: {
            question: string;
            answer: string;
        }[];
    };
    mobileSEO: {
        badge: string;
        title: string;
        titleHighlight: string;
        description: string;
        withoutSEO: string;
        withFramax: string;
        provenResults: string;
        ranking: string;
        rankingLabel: string;
        traffic: string;
        trafficLabel: string;
        // Mock UI
        yours: string;
        yourBrand: string;
        open24: string;
        call: string;
        route: string;
        web: string;
        page2: string;
    };

    dashboard: {
        menu: {
            management: string;
            finance: string;
            productivity: string;
            analytics: string;
            projects: string;
            clients: string;
            leads: string;
            services: string;
            invoices: string;
            payments: string;
            orders: string;
            calendar: string;
            notes: string;
            tasks: string;
            docs: string;
            settings: string;
            logout: string;
        };
    };
    invoices: {
        title: string;
        subtitle: string;
        createNew: string;
        createInvoice: string;
        createInvoiceDesc: string;
        createQuote: string;
        createQuoteDesc: string;
        allDocuments: string;
        invoices: string;
        quotes: string;
        totalQuoted: string;
        totalInvoiced: string;
        totalValue: string;
        declined: string;
        overdueAmount: string;
        accepted: string;
        paidThisMonth: string;
        noDocuments: string;
        noInvoices: string;
        noQuotes: string;
        createFirst: string;
        createFirstInvoice: string;
        createFirstQuote: string;
    };
    quoteModal: {
        title: string;
        clientDetails: string;
        clientName: string;
        contactPerson: string;
        email: string;
        phone: string;
        address: string;
        nif: string;
        quoteDetails: string;
        quoteDate: string;
        validUntil: string;
        items: string;
        addItem: string;
        notesTerms: string;
        exportPdf: string;
        saveSend: string;
        saving: string;
        billTo: string;
        date: string;
        description: string;
        qty: string;
        price: string;
        total: string;
        subtotal: string;
        tax: string;
        thankYou: string;
        clientNameRequired: string;
        itemRequired: string;
        failedToSave: string;
        selectService: string;
        clientNamePlaceholder: string;
        contactPersonPlaceholder: string;
        emailPlaceholder: string;
        phonePlaceholder: string;
        addressPlaceholder: string;
        nifPlaceholder: string;
        descriptionPlaceholder: string;
        notesPlaceholder: string;
        quote: string;
        legalNote: string;
        quoteNumber: string;
        issueDate: string;
        validity: string;
    };
}
