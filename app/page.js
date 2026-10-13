'use client';

import { useState, useEffect, useMemo } from 'react';
import catalogData from '../lib/catalog.json';
import {
  cleanProfileName,
  getProfileTestCount,
  coveringPackage,
  packageOwning,
  isBiggerThan,
  getProfileAllCodes,
  sanitizeStoredPackages,
  isProfileIncludedIn
} from '../lib/profileGroups';
import Header from '../components/Header';
import Hero from '../components/Hero';
import RateListSection from '../components/RateListSection';
import CartDrawer from '../components/CartDrawer';
import TestDetailDrawer from '../components/TestDetailDrawer';
import Footer from '../components/Footer';
import Toast from '../components/Toast';

export default function Home() {
  const [cart, setCart] = useState(new Map());
  const [cartPackages, setCartPackages] = useState(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [customerView, setCustomerView] = useState(false);
  const [selectedTestDetail, setSelectedTestDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const packageById = useMemo(() => {
    return Object.fromEntries((catalogData.packages || []).map(p => [p.id, p]));
  }, []);

  const catalogTestsByCode = useMemo(() => {
    return Object.fromEntries((catalogData.tests || []).map(t => [t.code, t]));
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('avm_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const map = new Map();
          parsed.forEach(code => {
            const test = catalogData.tests.find(t => t.code === code);
            if (test) map.set(code, test);
          });
          setCart(map);
        } else if (parsed && typeof parsed === 'object') {
          const rawPackages = parsed.packages || [];
          const sanitizedPkgs = sanitizeStoredPackages(rawPackages, catalogData.packages);

          const map = new Map();
          (parsed.codes || []).forEach(code => {
            const test = catalogData.tests.find(t => t.code === code);
            // Don't restore individual tests that are already inside a sanitized package
            const isOwned = packageOwning(code, sanitizedPkgs, packageById, catalogTestsByCode);
            if (test && !isOwned) map.set(code, test);
          });

          setCart(map);
          setCartPackages(sanitizedPkgs);
        }
      }
    } catch (e) {
      console.error('Failed to restore cart:', e);
    }
  }, [packageById, catalogTestsByCode]);

  const saveState = (nextCart, nextPackages) => {
    setCart(nextCart);
    setCartPackages(nextPackages);
    try {
      localStorage.setItem('avm_profile', JSON.stringify({
        codes: Array.from(nextCart.keys()),
        packages: Array.from(nextPackages)
      }));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  };

  const handleToggleTest = (code) => {
    const test = catalogData.tests.find(t => t.code === code);
    const testName = test ? test.name : code;

    const owner = packageOwning(code, cartPackages, packageById, catalogTestsByCode);
    if (owner) {
      setToastMessage(`${testName} is already included in ${cleanProfileName(owner.name)} — remove that profile to change it`);
      return;
    }

    const next = new Map(cart);
    if (next.has(code)) {
      next.delete(code);
      setToastMessage(`Removed ${testName} from your profile`);
    } else {
      if (test) {
        next.set(code, test);
        setToastMessage(`Added ${testName} to your profile`);
      }
    }
    saveState(next, cartPackages);
  };

  const handleTogglePackage = (pkg) => {
    const pkgName = cleanProfileName(pkg.name);
    const nextPkgs = new Set(cartPackages);

    if (nextPkgs.has(pkg.id)) {
      nextPkgs.delete(pkg.id);
      saveState(cart, nextPkgs);
      setToastMessage(`Removed ${pkgName} from your profile`);
      return;
    }

    const covering = coveringPackage(pkg, cartPackages, packageById, catalogTestsByCode);
    if (covering) {
      const coveringName = cleanProfileName(covering.name);

      if (isBiggerThan(pkg, covering, catalogTestsByCode)) {
        // Upgrade / Replace smaller covering profile with pkg
        nextPkgs.delete(covering.id);
        nextPkgs.add(pkg.id);

        // Remove any individual tests from cart that belong to pkg
        const pkgCodes = getProfileAllCodes(pkg, catalogTestsByCode);
        const nextCart = new Map(cart);
        pkgCodes.forEach(c => nextCart.delete(c));

        saveState(nextCart, nextPkgs);
        setToastMessage(`${coveringName} was replaced by ${pkgName}`);
        return;
      }

      // Blocked because pkg is already inside covering or overlaps
      const isSubset = isProfileIncludedIn(pkg, covering, catalogTestsByCode);
      const msg = isSubset
        ? `${pkgName} is already included in ${coveringName}`
        : `${pkgName} overlaps with ${coveringName} already in your profile — remove that first to add ${pkgName} separately`;
      setToastMessage(msg);
      return;
    }

    // Roll any individual tests already in cart into the package
    const pkgCodes = getProfileAllCodes(pkg, catalogTestsByCode);
    const nextCart = new Map(cart);
    const rolled = [];
    pkgCodes.forEach(c => {
      if (nextCart.has(c)) {
        rolled.push(nextCart.get(c)?.name || c);
        nextCart.delete(c);
      }
    });

    nextPkgs.add(pkg.id);
    saveState(nextCart, nextPkgs);

    if (rolled.length > 0) {
      setToastMessage(`${rolled.slice(0, 3).join(', ')}${rolled.length > 3 ? ` (+${rolled.length - 3} more)` : ''} rolled into ${pkgName}`);
    } else {
      setToastMessage(`Added ${pkgName} to your profile`);
    }
  };

  const handleRemoveItem = (code) => {
    const test = cart.get(code);
    const next = new Map(cart);
    next.delete(code);
    saveState(next, cartPackages);
    setToastMessage(`Removed ${test?.name || code} from your profile`);
  };

  const handleRemovePackage = (pkgId) => {
    const pkg = packageById[pkgId];
    const nextPkgs = new Set(cartPackages);
    nextPkgs.delete(pkgId);
    saveState(cart, nextPkgs);
    setToastMessage(`Removed ${pkg ? cleanProfileName(pkg.name) : 'profile'} from your profile`);
  };

  const handleClearCart = () => {
    saveState(new Map(), new Set());
    setToastMessage("Profile cleared");
  };

  const handleOpenTestDetail = (code) => {
    const test = catalogData.tests.find(t => t.code === code);
    if (test) setSelectedTestDetail(test);
  };

  const cartItems = Array.from(cart.values());
  const cartSet = new Set(cart.keys());
  const bundlePkgs = Array.from(cartPackages).map(id => packageById[id]).filter(Boolean);
  const totalCartCount = cart.size + cartPackages.size;

  const lplTestsCount = useMemo(() => (catalogData.tests || []).filter(t => t.processedAt === 'LPL').length, []);
  const lplProfilesCount = useMemo(() => (catalogData.packages || []).filter(p => !p.processedAt || p.processedAt === 'LPL').length, []);
  const minCatalogueRate = useMemo(() => {
    const lplT = (catalogData.tests || []).filter(t => t.processedAt === 'LPL').map(t => t.b2c || 9999);
    const lplP = (catalogData.packages || []).filter(p => !p.processedAt || p.processedAt === 'LPL').map(p => p.pricing?.b2c || 9999);
    return Math.min(...lplT, ...lplP);
  }, []);

  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col">
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <Hero
        onOpenCart={() => setCartOpen(true)}
        testCount={lplTestsCount}
        profileCount={lplProfilesCount}
        minRate={minCatalogueRate}
      />

      <RateListSection
        catalog={catalogData}
        cartSet={cartSet}
        cartPackages={cartPackages}
        onToggleTest={handleToggleTest}
        onTogglePackage={handleTogglePackage}
        onOpenTestDetail={handleOpenTestDetail}
        customerView={customerView}
      />

      <Footer
        onOpenCart={() => setCartOpen(true)}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        bundlePkgs={bundlePkgs}
        onRemoveItem={handleRemoveItem}
        onRemovePackage={handleRemovePackage}
        onClearCart={handleClearCart}
        customerView={customerView}
        setCustomerView={setCustomerView}
        onOpenTestDetail={handleOpenTestDetail}
      />

      <TestDetailDrawer
        test={selectedTestDetail}
        isOpen={!!selectedTestDetail}
        onClose={() => setSelectedTestDetail(null)}
        isAdded={selectedTestDetail ? cartSet.has(selectedTestDetail.code) : false}
        owner={selectedTestDetail ? packageOwning(selectedTestDetail.code, cartPackages, packageById, catalogTestsByCode) : null}
        onToggleTest={handleToggleTest}
        customerView={customerView}
      />

      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </main>
  );
}
