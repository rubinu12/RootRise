"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { useQuiz } from '@/app/context/QuizContext';

// --- Type Definitions ---
type ModalContentType = 'year' | 'topic';
interface DropdownItem {
  name: string;
}
interface SelectionModalProps {
  title: string;
  items: (string | number)[];
  showAllButton?: boolean;
  onClose: () => void;
  onCardClick: (item: string | number) => void;
  onAllClick?: () => void;
}
interface DropdownMenuProps {
  items: DropdownItem[];
  onItemClick: (name: string) => void;
  position: {
    top: number;
    left: number;
  } | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// --- Helper Data ---
const SUBJECTS: string[] = ["Polity", "Geo (Ind)", "Geo (World)", "Economics", "A. History", "Med. History", "M. History", "A & C", "Agriculture", "Env. & Eco.", "Sci. & Tech", "Misc."];
const EXAMS: string[] = ["UPSC CSE", "CDS", "CAPF", "EPFO"];

// --- Reusable Modal Component ---
const SelectionModal: React.FC<SelectionModalProps> = ({ title, items, showAllButton, onClose, onCardClick, onAllClick }) => {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel bg-gray-100 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-center text-gray-800 tracking-wide">{title}</h2>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {showAllButton && onAllClick && (
                        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 text-center">
                             <h3 className="text-lg font-semibold text-gray-800">Want to practice the whole subject?</h3>
                             <p className="text-sm text-gray-500 mt-1">Select this option to start a quiz with all available topics.</p>
                             <button onClick={onAllClick} className="btn w-full mt-4 bg-blue-600 text-white rounded-lg h-16 text-center p-3 font-semibold text-lg transition-all ease-in-out shadow-sm hover:bg-blue-700">
                                Practice All {title.replace('Select Topic for ', '')}
                            </button>
                        </div>
                    )}
                    <div className="grid grid-cols-4 gap-6">
                        {items.map(item => (
                            <button key={item} onClick={() => onCardClick(item)} className="btn bg-white rounded-lg text-gray-700 flex items-center justify-center h-24 text-center p-3 font-medium transition-all duration-200 ease-in-out border border-gray-200 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800">
                                <span className="break-words">{String(item)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
    document.body
  );
};

// --- Reusable Dropdown Component ---
const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, onItemClick, position, onMouseEnter, onMouseLeave }) => {
  if (!position) return null;
  return <div 
        className="absolute bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2 w-48 max-h-96 overflow-y-auto custom-scrollbar" 
        style={{ top: position.top, left: position.left }} 
        onMouseEnter={onMouseEnter} 
        onMouseLeave={onMouseLeave}
    >
        {items.map(item => <button key={item.name} onClick={() => onItemClick(item.name)} className="btn w-full text-left block px-5 py-3 text-base text-gray-700 hover:bg-gray-50 hover:text-blue-800">{item.name}</button>)}
    </div>;
};

// --- Main Navbar Component ---
export default function MainNavbar() {
  const [modalConfig, setModalConfig] = React.useState<{
    type: ModalContentType;
    title: string;
    items: (string | number)[];
    context?: any;
  } | null>(null);
  const [openDropdown, setOpenDropdown] = React.useState<'gs-year' | 'gs-subject' | null>(null);
  const [dropdownPosition, setDropdownPosition] = React.useState<{
    top: number;
    left: number;
  } | null>(null);
  const gsYearRef = React.useRef<HTMLLIElement>(null);
  const gsSubjectRef = React.useRef<HTMLLIElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const {
    loadAndStartQuiz
  } = useQuiz();

  const handleMouseEnter = (menu: 'gs-year' | 'gs-subject') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const ref = menu === 'gs-year' ? gsYearRef : gsSubjectRef;
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
      setOpenDropdown(menu);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  const handleExamSelect = async (exam: string) => {
    setOpenDropdown(null);
    try {
      const res = await fetch('/api/quizzes');
      const {
        data
      } = await res.json();
      const examData = data.find((d: any) => d.exams.some((e: any) => e.name === exam));
      const examYears = examData ? data.filter((d: any) => d.exams.some((e: any) => e.name === exam)).map((d: any) => d.year) : [];
      setModalConfig({
        type: 'year',
        title: `Select Year for ${exam}`,
        items: examYears,
        context: {
          exam
        }
      });
    } catch (error) {
      console.error("Failed to fetch years for exam", error);
    }
  };

  const handleSubjectSelect = async (subject: string) => {
    setOpenDropdown(null);
    try {
      const res = await fetch(`/api/topics?subject=${subject}`);
      const {
        data
      } = await res.json();
      setModalConfig({
        type: 'topic',
        title: `Select Topic for ${subject}`,
        items: data,
        context: {
          subject
        }
      });
    } catch (error) {
      console.error("Failed to fetch topics for subject", error);
    }
  };

  const handleModalCardClick = (item: string | number) => {
    if (!modalConfig) return;
    const {
      type,
      context
    } = modalConfig;
    if (type === 'year') {
      loadAndStartQuiz({
        exam: context.exam,
        year: String(item)
      });
    } else if (type === 'topic') {
      loadAndStartQuiz({
        subject: context.subject,
        topic: String(item)
      });
    }
    setModalConfig(null);
  };

  const handlePracticeAllSubject = () => {
    if (modalConfig?.context?.subject) {
      loadAndStartQuiz({
        subject: modalConfig.context.subject
      });
      setModalConfig(null);
    }
  };

  return (
    <>
            <nav className="max-w-[1300px] mx-auto px-8 py-6 border-b border-gray-100">
                <ul className="flex justify-center items-center space-x-8 text-sm">
                    <li><a href="#" className="nav-link active">Dashboard</a></li>
                    <li ref={gsYearRef} onMouseEnter={() => handleMouseEnter('gs-year')} onMouseLeave={handleMouseLeave}><a href="#" className="nav-link">GS-Year</a></li>
                    <li ref={gsSubjectRef} onMouseEnter={() => handleMouseEnter('gs-subject')} onMouseLeave={handleMouseLeave}><a href="#" className="nav-link">GS-Subject</a></li>
                    <li><a href="#" className="nav-link">CSAT</a></li>
                    <li><a href="#" className="nav-link">Analytics</a></li>
                    <li><a href="#" className="nav-link">Bookmarks</a></li>
                </ul>
            </nav>

            {openDropdown && createPortal(
                <DropdownMenu 
                    position={dropdownPosition} 
                    onMouseEnter={() => handleMouseEnter(openDropdown)} 
                    onMouseLeave={handleMouseLeave} 
                    items={openDropdown === 'gs-year' ? EXAMS.map(name => ({name})) : SUBJECTS.map(name => ({name}))}
                    onItemClick={openDropdown === 'gs-year' ? handleExamSelect : handleSubjectSelect}
                />, document.body)}
            
            {modalConfig && 
                <SelectionModal 
                    title={modalConfig.title} 
                    items={modalConfig.items}
                    showAllButton={modalConfig.type === 'topic'}
                    onClose={() => setModalConfig(null)} 
                    onCardClick={handleModalCardClick} 
                    onAllClick={handlePracticeAllSubject}
                />}

            <style jsx global>{`
                .nav-link { font-family: 'Lato', sans-serif; font-weight: 700; color: #777; padding-bottom: 0.5rem; transition: color 0.3s; border-bottom: 2px solid transparent; }
                .nav-link:hover { color: #000; }
                .nav-link.active { color: #000; border-bottom-color: #000; }
            `}</style>
        </>
  );
};