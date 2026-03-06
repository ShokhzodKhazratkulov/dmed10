
import React, { useEffect, useRef, useState } from 'react';
import { Certificate } from '../types';
import { DMEDLogo, DMEDCross, UzbekistanEmblem } from '../constants';
import { uploadFile, isCloudEnabled } from '../services/storage';

interface Props {
  certificate: Certificate;
  onClose?: () => void;
  onUpdate?: (updatedCert: Certificate) => void;
}

const CertificatePreview: React.FC<Props> = ({ certificate, onClose, onUpdate }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { data, id, securityCode, pdfUrl } = certificate;

  useEffect(() => {
    // 1. Generate QR Code
    const generateQR = () => {
      if (qrRef.current && (window as any).QRCode) {
        qrRef.current.innerHTML = '';
        const verifyUrl = `${window.location.origin}/?verify=${id}`;
        try {
          // @ts-ignore
          new QRCode(qrRef.current, {
            text: verifyUrl,
            width: 120,
            height: 120,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: 2 
          });
        } catch (err) {
          console.error("QR Generation failed:", err);
        }
      } else if (qrRef.current) {
        // Retry after a short delay if QRCode is not yet available
        setTimeout(generateQR, 200);
      }
    };

    generateQR();

    // 2. Automated Cloud Storage Sync
    if (isCloudEnabled() && !pdfUrl) {
      syncToDatabase();
    }
  }, [id, pdfUrl]);

  const syncToDatabase = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      const pdfBlob = await generateMedicalCertificatePdf();
      if (pdfBlob) {
        const cloudUrl = await uploadFile(id, pdfBlob, 'certificates');
        if (cloudUrl && onUpdate) {
          onUpdate({ ...certificate, pdfUrl: cloudUrl });
        }
      }
    } catch (err) {
      console.error("Database sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const generateMedicalCertificatePdf = async (): Promise<Blob | null> => {
    if (!printRef.current) return null;
    try {
      // @ts-ignore
      const { jsPDF } = window.jspdf;
      // @ts-ignore
      const canvas = await html2canvas(printRef.current, {
        scale: 4, // Higher scale for professional print quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector('.certificate-container') as HTMLElement;
          if (el) {
            el.style.transform = 'none';
            el.style.margin = '0';
            el.style.display = 'flex';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        hotfixes: ["px_lines"], // Fixes potential line rendering issues
        compress: true
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'SLOW'); // 'SLOW' for better compression/quality balance
      return pdf.output('blob');
    } catch (err) {
      return null;
    }
  };

  const handleDownload = async () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      return;
    }

    const blob = await generateMedicalCertificatePdf();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DMED_${data.patientFullName.replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Grid Cell component to match the table structure in the image
  const GridCell = ({ num, children, className = "" }: { num: string, children: React.ReactNode, className?: string }) => (
    <div className={`border-b border-r border-black p-1.5 relative min-h-[60px] flex flex-col ${className}`}>
      <span className="absolute top-0.5 left-1 font-bold text-[11px]">{num}</span>
      <div className="pl-5 text-[13px] leading-tight flex-1">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center bg-slate-200 min-h-screen py-4 sm:py-10 no-print font-['Arial']">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sticky top-4 z-50 px-4">
        <button 
          onClick={handleDownload}
          className="bg-[#0035AD] text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-full font-black uppercase tracking-widest shadow-2xl hover:bg-blue-800 transition flex items-center gap-2 text-[10px] sm:text-xs"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          PDF Yuklab Olish
        </button>
      </div>

      {/* The A4 Container - Pixel Perfect for the shared image */}
      <div 
        ref={printRef}
        className="bg-white w-[210mm] h-[297mm] p-[10mm] shadow-2xl relative certificate-container text-black overflow-hidden flex flex-col mx-auto"
        style={{ color: 'black' }}
      >
        {/* Header Section - Matches Image */}
        <div className="text-center mb-4">
          <div className="grid grid-cols-3 items-start">
            <div className="text-[13px] font-bold leading-tight text-left col-span-1">
              O'zbekiston Respublikasi Sog'liqni<br/>
              saqlash vazirligi<br/>
              <span className="font-normal">{data.clinicName}</span>
            </div>
            <div className="flex justify-center col-span-1">
              <UzbekistanEmblem className="w-16 h-16" />
            </div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-[16px] font-bold mb-0.5">
              Ta’lim olayotgan shaxslar uchun mehnatga layoqatsizlik ma’lumotnomasi
            </h1>
            <div className="text-[14px] font-bold">
              Ro’yhatga olingan sana: {data.registrationDate}
            </div>
            <div className="text-[16px] font-bold mb-2">
              No {data.certificateNumber}
            </div>
            
            <div className="text-[13px] font-bold">
              Tibbiy muassasa nomi: <span className="font-bold">{data.tibbiyMuassasaNomi}</span><br/>
              <span className="font-normal text-[10px]">(qaysi muassasa tomonidan berilgan)</span>
            </div>
          </div>
        </div>

        {/* Grid Content - Matches Table Structure */}
        <div className="border-t border-l border-black">
          <div className="grid grid-cols-2">
            {/* Row 1 */}
            <GridCell num="1">
              <div className="font-bold mb-1">Vaqtincha mehnatga layoqatsiz fuqaro haqidagi ma’lumotlar:</div>
              <div><b>FISh:</b> {data.patientFullName}</div>
              <div><b>Jinsi:</b> {data.patientGender}</div>
              <div><b>JShShIR:</b> {data.patientPinfl}</div>
              <div><b>Yoshi:</b> {data.patientAge} yosh</div>
              <div><b>Bemorga qarindoshligi:</b> {data.relativesRelation || '-'}</div>
            </GridCell>
            <GridCell num="1a">
              <div className="font-bold mb-1">Bemor bola haqidagi ma’lumotlar:</div>
              <div><b>FISh:</b> {data.childFullName || '-'}</div>
              <div><b>Jinsi:</b> {data.childGender || '-'}</div>
              <div><b>JShShIR:</b> {data.childPinfl || '-'}</div>
              <div><b>Yoshi:</b> {data.childAge ? `${data.childAge} yosh` : '- yosh'}</div>
            </GridCell>

            {/* Row 2 */}
            <GridCell num="2">
              <b>Yashash manzili:</b> {data.address}
            </GridCell>
            <GridCell num="3">
              <b>Ish/o`qish joyi:</b> {data.workOrStudyPlace}
            </GridCell>

            {/* Row 3 */}
            <GridCell num="4">
              <b>Biriktirilgan tibbiy muassasa:</b><br/>
              {data.assignedClinic}
            </GridCell>
            <GridCell num="5">
              <b>Mehnatga layoqatsizlik sababi:</b><br/>
              {data.reason}
            </GridCell>

            {/* Row 4 */}
            <GridCell num="6">
              <b>Tashxis (KXT-10 kodi va Nomi):</b><br/>
              {data.diagnosisInitialCode}: {data.diagnosisInitialName}
            </GridCell>
            <GridCell num="7">
              <b>Davolovchi shifokor FISH:</b> {data.doctorFullName}<br/>
              <b>Bo’lim boshlig’i (mas’ul shaxs) FISH:</b><br/>
              {data.departmentHeadFullName}
            </GridCell>

            {/* Row 5 */}
            <GridCell num="8">
              <b>Yakuniy tashxis (Nomi va KXT-10 kodi):</b><br/>
              {data.diagnosisFinalCode}: {data.diagnosisFinalName}
            </GridCell>
            <GridCell num="9">
              <b>VMK raisining FISH:</b> {data.vmkChairFullName}
            </GridCell>

            {/* Row 6 */}
            <GridCell num="10">
              <b>Yuqumli kasallikka chalingan bemor bilan kontaktda bo’lganligi haqidagi ma’lumotlar:</b><br/>
              {data.contactInfectious}
            </GridCell>
            <GridCell num="11">
              <b>TIEK ma’lumotlari:</b><br/>
              Ko’rikdan o’tgan sanasi: {data.tiekCheckDate || '-'}<br/>
              Xulosa: {data.tiekConclusion || '-'}<br/>
              <b>TIEK raisi FISH:</b> {data.vmkChairFullName}
            </GridCell>

            {/* Row 7 */}
            <GridCell num="12">
              <b>Tartib:</b> {data.tartib}<br/>
              <b>Tartib buzilganlik to’g’risida qaydlar:</b> {data.tartibNotes || '-'}
            </GridCell>
            <GridCell num="13">
              <b>Ishdan ozod etilgan kunlar:</b><br/>
              <div className="space-y-0.5">
                {data.releasedDays.map((range, idx) => (
                  <div key={idx}>{range.start} - {range.end}</div>
                ))}
              </div>
            </GridCell>

            {/* Row 8 */}
            <GridCell num="14">
              <b>Vaqtincha boshqa ishga o'tkazilsin:</b> {data.temporaryOtherJob}
            </GridCell>
            <GridCell num="15" className="text-[11px]">
              <b>Boshqa shahardan kelgan bemorga mehnatga layoqatsizlik varaqasini berish uchun ruhsat etiladi:</b> {data.otherCityPermission}
            </GridCell>

            {/* Row 9 */}
            <GridCell num="16">
              <b>Ushbu ma’lumotnoma berilgan muassasa:</b><br/>
              {data.certificateInstitutionType}
            </GridCell>
            <GridCell num="17">
              <b>Muassasa nomi:</b> {data.certificateInstitutionName}
            </GridCell>
          </div>
        </div>

        {/* Footer Area - Matches Image */}
        <div className="mt-auto pt-4 flex justify-between items-end">
          <div className="max-w-[75%]">
            <div className="mb-4">
              <DMEDLogo />
            </div>
            <p className="text-[12px] leading-tight mb-3 text-slate-700">
              Hujjat DMED Yagona tibbiy axborot tizimida yaratilgan. Hujjatning haqqoniyligini<br/>
              <b>https://{window.location.hostname}</b> saytida hujjatning ID kodini kiritish, yoki QR-kod orqali tekshirish<br/>
              mumkin
            </p>
            <div className="text-[12px] font-bold space-y-0.5">
              <div>Hujjat ID: <span className="font-normal">{id}</span></div>
            </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="text-[42px] font-bold tracking-[2px] font-mono leading-none">
              {securityCode}
            </div>
            <div className="relative p-1 border border-black bg-white">
              <div ref={qrRef} className="bg-white"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white p-0.5 border border-slate-100">
                  <DMEDCross className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
