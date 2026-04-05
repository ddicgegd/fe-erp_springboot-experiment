import { Shipment, User } from './types';

export const MOCK_USER: User = {
    id: 'USR-992-884-X',
    name: 'Lâm Nguyễn',
    email: 'lam.n@nexus.com',
    role: 'Quản lý Logistics',
    clearance: 'QUYỀN TRUY CẬP CẤP 4',
    avatar: 'https://picsum.photos/seed/liam/200/200'
};

export const MOCK_SHIPMENTS: Shipment[] = [
    {
        id: 'TRK-9821-VN-2024',
        name: 'Chuẩn bị Thuyết trình',
        status: 'In Transit',
        deadline: '20 tháng 12',
        timeSpent: '3 giờ 30 phút',
        location: 'Quốc lộ 1A, Khu vực Thanh Hóa',
        progress: 75,
        weight: 24.5,
        itemsCount: 3
    },
    {
        id: 'TRK-4452-SG-2024',
        name: 'Đánh giá Kế hoạch Dự án',
        status: 'Completed',
        deadline: '21 tháng 12',
        timeSpent: '1 giờ 15 phút',
        location: 'Kho trung tâm TP.HCM',
        progress: 100,
        weight: 12.0,
        itemsCount: 1
    },
    {
        id: 'TRK-1129-HN-2024',
        name: 'Phê duyệt Ngân sách',
        status: 'Pending',
        deadline: '25 tháng 12',
        timeSpent: '2 giờ 45 phút',
        location: 'Trạm trung chuyển Đà Nẵng',
        progress: 30,
        weight: 4.5,
        itemsCount: 5
    }
];

export const INVOICE_ITEMS = [
    { sku: '#GRAPH-RTX-4090', name: 'NVIDIA GeForce RTX 4090', qty: 1, price: 1599.00 },
    { sku: '#CPU-INT-i9', name: 'Intel Core i9-13900K', qty: 1, price: 589.00 },
    { sku: '#RAM-COR-32', name: 'Corsair Dominator 32GB', qty: 2, price: 320.00 },
];
