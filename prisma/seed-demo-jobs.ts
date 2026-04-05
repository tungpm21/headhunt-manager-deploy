import { prisma } from "../src/lib/prisma";

const DEMO_JOBS = [
    { title: "Trưởng phòng Kế toán (Chief Accountant)", industry: "Kế toán", location: "Hà Nội", workType: "Full-time", salaryDisplay: "25 - 40 triệu", isFeatured: true },
    { title: "Kỹ sư Tự động hóa (Automation Engineer)", industry: "Sản xuất", location: "Bắc Ninh", workType: "Full-time", salaryDisplay: "20 - 35 triệu", isFeatured: true },
    { title: "Chuyên viên Nhân sự (HR Specialist)", industry: "Nhân sự", location: "TP. Hồ Chí Minh", workType: "Full-time", salaryDisplay: "15 - 25 triệu", isFeatured: true },
    { title: "Senior Frontend Developer (React/Next.js)", industry: "IT / Phần mềm", location: "Hà Nội", workType: "Hybrid", salaryDisplay: "35 - 55 triệu", isFeatured: true },
    { title: "Quality Control Supervisor", industry: "QC / QA", location: "Hải Phòng", workType: "Full-time", salaryDisplay: "18 - 30 triệu", isFeatured: true },
    { title: "Logistics Coordinator (Điều phối Logistics)", industry: "Logistics", location: "TP. Hồ Chí Minh", workType: "Full-time", salaryDisplay: "15 - 22 triệu", isFeatured: false },
    { title: "Kỹ sư Điện (Electrical Engineer)", industry: "Sản xuất", location: "Vĩnh Phúc", workType: "Full-time", salaryDisplay: "22 - 38 triệu", isFeatured: true },
    { title: "Digital Marketing Executive", industry: "Marketing", location: "Hà Nội", workType: "Hybrid", salaryDisplay: "12 - 20 triệu", isFeatured: false },
    { title: "Supply Chain Manager", industry: "Logistics", location: "Bắc Ninh", workType: "Full-time", salaryDisplay: "40 - 60 triệu", isFeatured: true },
    { title: "Production Planning Specialist", industry: "Sản xuất", location: "Hải Dương", workType: "Full-time", salaryDisplay: "18 - 28 triệu", isFeatured: false },
    { title: "ERP Implementation Consultant", industry: "IT / Phần mềm", location: "TP. Hồ Chí Minh", workType: "Full-time", salaryDisplay: "30 - 50 triệu", isFeatured: true },
    { title: "HSE Officer (An toàn Lao động)", industry: "Sản xuất", location: "Đồng Nai", workType: "Full-time", salaryDisplay: "15 - 22 triệu", isFeatured: false },
];

async function main() {
    // Get active employers to distribute jobs
    const employers = await prisma.employer.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, companyName: true },
        take: 10,
    });

    if (employers.length === 0) {
        console.error("No active employers found. Please seed employers first.");
        process.exit(1);
    }

    console.log(`Found ${employers.length} employers, creating ${DEMO_JOBS.length} demo jobs...`);

    for (let i = 0; i < DEMO_JOBS.length; i++) {
        const job = DEMO_JOBS[i];
        const employer = employers[i % employers.length];
        const slug = job.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .slice(0, 60) + `-${Date.now()}-${i}`;

        await prisma.jobPosting.create({
            data: {
                title: job.title,
                slug,
                description: `<p>Chúng tôi đang tuyển dụng vị trí <strong>${job.title}</strong> tại ${employer.companyName}.</p><p>Đây là cơ hội tuyệt vời để phát triển sự nghiệp trong môi trường doanh nghiệp FDI.</p>`,
                industry: job.industry,
                location: job.location,
                workType: job.workType,
                salaryDisplay: job.salaryDisplay,
                isFeatured: job.isFeatured,
                status: "APPROVED",
                publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                employerId: employer.id,
                quantity: Math.floor(Math.random() * 5) + 1,
                skills: [],
            },
        });

        console.log(`  ✅ Created: ${job.title} → ${employer.companyName}`);
    }

    console.log(`\nDone! Created ${DEMO_JOBS.length} demo jobs.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
