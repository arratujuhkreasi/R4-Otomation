export interface RajaOngkirPayload {
    origin: string; // e.g., '501' (Yogyakarta)
    destination: string; // e.g., '152' (Jakarta Pusat)
    weight: number; // in grams
    courier: 'jne' | 'pos' | 'tiki';
}

export interface WatzapMessage {
    phone_number: string; // e.g., '628123456789'
    message: string;
    file_url?: string;
}

export interface IntegrationResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Mock API Call untuk Cek Ongkir (RajaOngkir)
 */
export async function checkOngkir(payload: RajaOngkirPayload): Promise<IntegrationResponse<any>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // ERROR SIMULATION: Jika berat > 50kg, simulasi "Courier not available" atau Quota Habis
    if (payload.weight > 50000) {
        return {
            success: false,
            error: "Maaf, layanan RajaOngkir Anda mencapai batas kuota harian. Upgrade paket Anda atau coba lagi besok."
        };
    }

    // ERROR SIMULATION: Random Network Error (1% chance)
    if (Math.random() < 0.01) {
        return {
            success: false,
            error: "Koneksi ke server RajaOngkir terputus (Timeout). Silakan periksa koneksi internet Anda."
        };
    }

    // ERROR SIMULATION: Invalid City ID
    if (payload.destination === '000') {
        return {
            success: false,
            error: "ID Kota Tujuan tidak ditemukan di database RajaOngkir."
        };
    }

    // SUCCESS MOCK RESPONSE
    return {
        success: true,
        data: [
            {
                service: "REG",
                description: "Layanan Reguler",
                cost: [
                    {
                        value: 22000 * (payload.weight / 1000),
                        etd: "2-3 Hari",
                        note: ""
                    }
                ]
            },
            {
                service: "YES",
                description: "Yakin Esok Sampai",
                cost: [
                    {
                        value: 35000 * (payload.weight / 1000),
                        etd: "1-1 Hari",
                        note: ""
                    }
                ]
            }
        ]
    };
}

/**
 * Mock API Call untuk Kirim WhatsApp (Watzap.id / Fonte)
 */
export async function sendWhatsApp(payload: WatzapMessage): Promise<IntegrationResponse<any>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // ERROR SIMULATION: Invalid Phone Number format
    if (!payload.phone_number.startsWith('62')) {
        return {
            success: false,
            error: "Gagal mengirim pesan: Nomor telepon harus diawali dengan '62' (Format Internasional)."
        };
    }

    // ERROR SIMULATION: Server Down
    if (payload.message === 'TRIGGER_500') {
        return {
            success: false,
            error: "Watzap API Gateway sedang maintenance. Mohon coba 5 menit lagi."
        };
    }

    // SUCCESS MOCK RESPONSE
    return {
        success: true,
        data: {
            id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            status: 'sent',
            timestamp: new Date().toISOString()
        }
    };
}
