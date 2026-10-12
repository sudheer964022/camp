import Link from 'next/link';

export default function Footer({ onOpenCart }) {
  return (
    <>
      <footer className="bg-navy text-paper border-t border-navy-soft py-14">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 pb-10 border-b border-white/10">
            <div className="space-y-3">
              <img className="block bg-white rounded-none h-[53px] w-auto" src="/assets/images/avm-logo.png" alt="AVMLabs" height={53} />
              <p className="text-sm text-[#CFE2F2] max-w-sm">Automated diagnostics, one transparent rate card</p>
            </div>
            <div>
              <ul className="space-y-2.5 text-sm text-[#CFE2F2] md:pt-8">
                <li><Link className="hover:text-amber transition-colors" href="/#ratelist">Rate List</Link></li>
                <li><Link className="hover:text-amber transition-colors" href="/how-to-create-a-camp">How to Create a Camp</Link></li>
                <li><button onClick={onOpenCart} type="button" className="hover:text-amber transition-colors text-left cursor-pointer">Make My Profile</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm text-[#CFE2F2]">
                <li>
                  <a
                    className="inline-flex items-center gap-2 text-emerald-bg hover:text-emerald font-semibold transition-colors"
                    href="https://wa.me/919600661732?text=Interested%20in%20B2B%20Collaboration"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12.003 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.464 3.484 1.345 4.997L2 22l5.132-1.334a9.96 9.96 0 0 0 4.87 1.24h.001c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.18-2.929-7.07a9.935 9.935 0 0 0-7.068-2.929zm0 18.174h-.001a8.2 8.2 0 0 1-4.173-1.142l-.299-.177-3.104.808.828-3.027-.194-.31a8.163 8.163 0 0 1-1.253-4.349c0-4.516 3.674-8.19 8.2-8.19 2.19 0 4.247.853 5.795 2.401a8.144 8.144 0 0 1 2.399 5.796c-.003 4.516-3.677 8.19-8.198 8.19z" />
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    +91 96006 61732
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-[#94A3B8]">
            <span>© 2026 AVMLabs</span>
            <span>Rates in INR (₹). Indicative rate card, not a medical prescription.</span>
          </div>
        </div>
      </footer>

      <a
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
        href="https://wa.me/919600661732?text=Interested%20in%20B2B%20Collaboration"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with AVMLabs on WhatsApp"
      >
        <svg className="w-5 h-5 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.003 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.464 3.484 1.345 4.997L2 22l5.132-1.334a9.96 9.96 0 0 0 4.87 1.24h.001c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.18-2.929-7.07a9.935 9.935 0 0 0-7.068-2.929zm0 18.174h-.001a8.2 8.2 0 0 1-4.173-1.142l-.299-.177-3.104.808.828-3.027-.194-.31a8.163 8.163 0 0 1-1.253-4.349c0-4.516 3.674-8.19 8.2-8.19 2.19 0 4.247.853 5.795 2.401a8.144 8.144 0 0 1 2.399 5.796c-.003 4.516-3.677 8.19-8.198 8.19z" />
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        </svg>
      </a>
    </>
  );
}
