
import React from 'react';
import { UZBEKISTAN_EMBLEM_BASE64, DMED_LOGO_BASE64 } from './emblem';

export const DMED_PRIMARY = '#0066CC';

export const UzbekistanEmblem: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => (
  <img 
    src={UZBEKISTAN_EMBLEM_BASE64} 
    alt="Gerb" 
    className={className} 
    loading="eager"
  />
);

export const DMED_LOGO_URL = DMED_LOGO_BASE64;

export const DMEDCross: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <img 
    src={DMED_LOGO_BASE64} 
    alt="DMED Cross" 
    className={`${className} object-contain`}
    loading="eager"
  />
);

export const DMEDLogo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
      <img 
        src={DMED_LOGO_BASE64} 
        alt="DMED Logo" 
        className="w-full h-full object-contain"
        loading="eager"
        style={{ display: 'block' }}
      />
    </div>
    <span className="font-bold text-2xl tracking-tighter text-[#0066CC] leading-none">DMED</span>
  </div>
);

export const DEFAULT_CERT_DATA: any = {
  clinicName: "Chilonzor tumani 34 - sonli oilaviy poliklinika",
  registrationDate: "01.02.2026",
  certificateNumber: "01ТШ 007204125",
  tibbiyMuassasaNomi: "Chilonzor tumani 34 - sonli oilaviy poliklinika",
  
  patientFullName: "TAGANOV BEHZOD MARKS O‘G‘LI",
  patientGender: "erkak",
  patientPinfl: "51612047310013",
  patientAge: "20",
  relativesRelation: "O‘zi",
  
  childFullName: "-",
  childGender: "-",
  childPinfl: "-",
  childAge: "-",

  address: "Toshkent shahri, Mirobod tumani, Саракул 3 в 15",
  workOrStudyPlace: "ТДТрУ",
  assignedClinic: "Chilonzor tumani 34 - sonli oilaviy poliklinika",
  reason: "Kasallik",
  diagnosisInitialCode: "J20.9",
  diagnosisInitialName: "Аниқланмаган ўткир бронхит",
  doctorFullName: "O‘RINOV M.CH.",
  departmentHeadFullName: "RUZIYEVA M.E.",
  diagnosisFinalCode: "J20.9",
  diagnosisFinalName: "Аниқланмаган ўткир бронхит",
  vmkChairFullName: "MUSIRMANKULOVA X.S.",
  contactInfectious: "Yo'q",
  tiekCheckDate: "-",
  tiekConclusion: "-",
  tiekChairFullName: "MUSIRMANKULOVA X.S.",
  tartib: "Ambulator",
  tartibNotes: "-",
  releasedDays: [
    { start: "25.11.2025", end: "01.12.2025" }
  ],
  temporaryOtherJob: "Yo'q",
  otherCityPermission: "Yo'q",
  certificateInstitutionType: "Oliygoh",
  certificateInstitutionName: "TDTU",
  creationDateTime: "19.03.2026 09:59"
};
