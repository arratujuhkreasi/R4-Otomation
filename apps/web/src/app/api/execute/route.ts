
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import type { NodeExecutionResult } from '@/types';
import { checkOngkir, sendWhatsApp, RajaOngkirPayload, WatzapMessage } from '@/lib/integrations';

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { nodes, edges } = await req.json();

        // ----------------------------------------------------
        // EXECUTION ENGINE (Lite Version)
        // ----------------------------------------------------

        const results: NodeExecutionResult[] = [];

        for (const node of nodes) {
            // Mock processing delay to look cool
            await new Promise(r => setTimeout(r, 800));

            let outputData: any = { message: 'Node executed successfully' };
            let status = 'success';
            let errorDetails = undefined;

            try {
                // 1. WhatsApp Logic
                if (node.type.includes('whatsapp') || node.data?.label?.toLowerCase().includes('whatsapp')) {
                    const payload: WatzapMessage = {
                        phone_number: node.data.parameters?.phoneNumber || '',
                        message: node.data.parameters?.message || ''
                    };

                    // Validation
                    if (!payload.phone_number) throw new Error('Nomor telepon wajib diisi');
                    if (!payload.message) throw new Error('Pesan wajib diisi');

                    const res = await sendWhatsApp(payload);
                    if (!res.success) throw new Error(res.error || 'Gagal mengirim WhatsApp');
                    outputData = res.data;
                }

                // 2. Cek Ongkir Logic (Mapped from httpRequestNode with label 'Cek Ongkir')
                else if (node.data?.label?.toLowerCase().includes('cek ongkir')) {
                    const payload: RajaOngkirPayload = {
                        origin: node.data.parameters?.origin || '501', // Default Yogyakarta
                        destination: node.data.parameters?.destination || '152', // Default Jakarta Pusat
                        weight: Number(node.data.parameters?.weight) || 1000,
                        courier: node.data.parameters?.courier || 'jne'
                    };

                    const res = await checkOngkir(payload);
                    if (!res.success) throw new Error(res.error || 'Gagal cek ongkir');
                    outputData = res.data;
                }

                // 3. Shopee Logic (Mock)
                else if (node.type.includes('shopee')) {
                    if (!node.data.parameters?.shopId) throw new Error('Toko belum dipilih');

                    // Simulasi ambil order
                    outputData = {
                        orders: [
                            { id: 'ORD-2024-001', status: 'UNPAID', total: 150000, buyer: 'Budi Santoso' },
                            { id: 'ORD-2024-002', status: 'READY_TO_SHIP', total: 275000, buyer: 'Siti Aminah' }
                        ]
                    };

                    if (node.data.parameters?.onlyUnpaid) {
                        outputData.orders = outputData.orders.filter((o: any) => o.status === 'UNPAID');
                    }
                }

                // 4. Default / HTTP Request
                else if (node.type === 'httpRequestNode' && node.data?.parameters?.url) {
                    try {
                        // Real fetch if user wants, but for now mock success
                        outputData = {
                            url: node.data.parameters.url,
                            method: 'GET',
                            status: 200,
                            data: { mock: 'response from external api' }
                        };
                    } catch (e) {
                        throw new Error('HTTP Request failed');
                    }
                }

            } catch (e) {
                status = 'error';
                errorDetails = e instanceof Error ? e.message : 'Unknown error';
                console.error(`Error executing node ${node.id}:`, e);
            }

            results.push({
                nodeId: node.id,
                status: status as any,
                data: errorDetails ? { error: errorDetails } : outputData,
                startedAt: new Date(),
                finishedAt: new Date(),
            });

            // Stop execution chain if error (optional, but good for flows)
            if (status === 'error') break;
        }

        return NextResponse.json({
            success: true,
            results,
        });

    } catch (error) {
        console.error('Execution error:', error);
        return NextResponse.json(
            { error: 'Execution failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
