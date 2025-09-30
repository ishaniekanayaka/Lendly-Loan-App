// import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
// import { db } from '@/firebase';
// import { LoanApplication, LoanFormData } from '@/types/loan';

// // ---------------- Cloudinary Config ----------------
// const CLOUDINARY_UPLOAD_PRESET = "lendy-loan"; 
// const CLOUDINARY_CLOUD_NAME = "dwcvrttrd"; 
// const COLLECTION_NAME = 'loanApplications';

// // ----------------------------------------------------
// // Upload Image to Cloudinary (for profile, etc.)
// // ----------------------------------------------------
// export const uploadImage = async (uri: string, fileName: string) => {
//   const formData = new FormData();
//   formData.append("file", { uri, type: "image/jpeg", name: fileName } as any);
//   formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

//   const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
//     method: "POST",
//     body: formData,
//   });

//   const data = await res.json();
//   if (!data.secure_url) throw new Error("Image upload failed");
//   return data.secure_url;
// };

// // ----------------------------------------------------
// // Upload PDF/Docs to Cloudinary (must use raw/upload)
// // ----------------------------------------------------
// export const uploadPdf = async (uri: string, fileName: string) => {
//   const formData = new FormData();
//   formData.append("file", { uri, type: "application/pdf", name: fileName } as any);
//   formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

//   const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`, {
//     method: "POST",
//     body: formData,
//   });

//   const data = await res.json();
//   if (!data.secure_url) throw new Error("PDF upload failed");
//   return data.secure_url; // ✅ Correct public link
// };

// // ----------------------------------------------------
// // CREATE (Save new Loan + upload PDF to Cloudinary)
// // ----------------------------------------------------
// export const submitLoanApplication = async (formData: LoanFormData): Promise<string> => {
//   let paysheetUrl = '';
//   let paysheetName = '';

//   if (formData.paysheet) {
//     paysheetName = formData.paysheet.name;
//     paysheetUrl = await uploadPdf(formData.paysheet.uri, paysheetName); // ✅ use uploadPdf
//   }

//   const loanData: Omit<LoanApplication, 'id'> = {
//     name: formData.name,
//     email: formData.email,
//     telephone: formData.telephone,
//     occupation: formData.occupation,
//     salary: formData.salary,
//     paysheetUrl, 
//     paysheetName,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };

//   const docRef = await addDoc(collection(db, COLLECTION_NAME), loanData);
//   return docRef.id;
// };

// // ----------------------------------------------------
// // READ ALL (Get all loan applications with PDF URL)
// // ----------------------------------------------------
// export const getLoanApplications = async (): Promise<LoanApplication[]> => {
//   const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
//   const applications: LoanApplication[] = [];

//   querySnapshot.forEach((docSnap) => {
//     const data = docSnap.data();
//     applications.push({
//       id: docSnap.id,
//       ...data,
//       createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
//       updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
//     } as LoanApplication);
//   });

//   return applications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
// };

// // ----------------------------------------------------
// // READ ONE (Get single application by ID)
// // ----------------------------------------------------
// export const getLoanApplication = async (id: string): Promise<LoanApplication | null> => {
//   const docRef = doc(db, COLLECTION_NAME, id);
//   const docSnap = await getDoc(docRef);

//   if (docSnap.exists()) {
//     const data = docSnap.data();
//     return {
//       id: docSnap.id,
//       ...data,
//       createdAt: data.createdAt?.toDate() || new Date(),
//       updatedAt: data.updatedAt?.toDate() || new Date(),
//     } as LoanApplication;
//   }
//   return null;
// };

// // ----------------------------------------------------
// // UPDATE (Update details + replace PDF if new uploaded)
// // ----------------------------------------------------
// export const updateLoanApplication = async (id: string, formData: LoanFormData): Promise<void> => {
//   const docRef = doc(db, COLLECTION_NAME, id);
//   const docSnap = await getDoc(docRef);

//   if (!docSnap.exists()) throw new Error('Application not found');

//   let paysheetUrl = docSnap.data().paysheetUrl || '';
//   let paysheetName = docSnap.data().paysheetName || '';

//   if (formData.paysheet) {
//     paysheetName = formData.paysheet.name;
//     paysheetUrl = await uploadPdf(formData.paysheet.uri, paysheetName); // ✅ use uploadPdf
//   }

//   await updateDoc(docRef, {
//     name: formData.name,
//     email: formData.email,
//     telephone: formData.telephone,
//     occupation: formData.occupation,
//     salary: formData.salary,
//     paysheetUrl,
//     paysheetName,
//     updatedAt: new Date(),
//   });
// };

// // ----------------------------------------------------
// // DELETE (Remove loan application by ID)
// // ----------------------------------------------------
// export const deleteLoanApplication = async (id: string): Promise<void> => {
//   const docRef = doc(db, COLLECTION_NAME, id);
//   await deleteDoc(docRef);
// };
// loanService.ts

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { LoanApplication, LoanFormData } from '@/types/loan';

// Cloudinary config
const CLOUDINARY_UPLOAD_PRESET = "lendy-loan"; 
const CLOUDINARY_CLOUD_NAME = "dwcvrttrd"; 
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

const COLLECTION_NAME = 'loanApplications';

// --- Helper: Upload file to Cloudinary ---
const uploadToCloudinary = async (fileUri: string, fileName: string): Promise<string> => {
  const formData = new FormData();

  // React Native FormData file object
  formData.append("file", {
    uri: fileUri,
    type: "application/pdf",
    name: fileName,
  } as any);

  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error("Cloudinary upload failed: " + errorText);
  }

  const data = await uploadResponse.json();
  return data.secure_url;
};



// --- Enhanced PDF URL generators ---
export const generatePDFViewUrl = (cloudinaryUrl: string): string => {
  try {
    if (cloudinaryUrl && cloudinaryUrl.includes("cloudinary.com")) {
      const parts = cloudinaryUrl.split("/upload/");
      if (parts.length === 2) {
        // For viewing: force inline display, optimize for web viewing
        return `${parts[0]}/upload/fl_attachment:inline,f_auto,q_auto,w_1200,dpr_auto/${parts[1]}`;
      }
    }
    return cloudinaryUrl;
  } catch (error) {
    console.error("Error generating PDF view URL:", error);
    return cloudinaryUrl;
  }
};

export const generatePDFDownloadUrl = (cloudinaryUrl: string, fileName?: string): string => {
  try {
    if (cloudinaryUrl && cloudinaryUrl.includes("cloudinary.com")) {
      const parts = cloudinaryUrl.split("/upload/");
      if (parts.length === 2) {
        const downloadFileName = fileName ? encodeURIComponent(fileName) : 'paysheet.pdf';
        // Force download with proper filename
        return `${parts[0]}/upload/fl_attachment:${downloadFileName}/${parts[1]}`;
      }
    }
    return cloudinaryUrl;
  } catch (error) {
    console.error("Error generating PDF download URL:", error);
    return cloudinaryUrl;
  }
};

// --- Enhanced mobile PDF URL generator ---
export const generateMobilePDFUrl = (cloudinaryUrl: string): string => {
  try {
    if (cloudinaryUrl && cloudinaryUrl.includes("cloudinary.com")) {
      const parts = cloudinaryUrl.split("/upload/");
      if (parts.length === 2) {
        // Optimize for mobile but DO NOT force download
        return `${parts[0]}/upload/f_auto,q_auto:eco,w_800/${parts[1]}`;
      }
    }
    return cloudinaryUrl;
  } catch (error) {
    console.error("Error generating mobile PDF URL:", error);
    return cloudinaryUrl;
  }
};

// --- Direct PDF URL for embedding ---
export const generateEmbedPDFUrl = (cloudinaryUrl: string): string => {
  try {
    if (cloudinaryUrl && cloudinaryUrl.includes("cloudinary.com")) {
      const parts = cloudinaryUrl.split("/upload/");
      if (parts.length === 2) {
        // For embedding in WebView or PDF viewers
        return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
      }
    }
    return cloudinaryUrl;
  } catch (error) {
    console.error("Error generating embed PDF URL:", error);
    return cloudinaryUrl;
  }
};

// --- Get optimized URL based on usage ---
export const getOptimizedPDFUrl = (cloudinaryUrl: string, usage: 'view' | 'download' | 'mobile' | 'embed' = 'view', fileName?: string): string => {
  if (!cloudinaryUrl) return '';
  
  switch (usage) {
    case 'download':
      return generatePDFDownloadUrl(cloudinaryUrl, fileName);
    case 'mobile':
      return generateMobilePDFUrl(cloudinaryUrl);
    case 'embed':
      return generateEmbedPDFUrl(cloudinaryUrl);
    case 'view':
    default:
      return generatePDFViewUrl(cloudinaryUrl);
  }
};

// --- Create ---
export const submitLoanApplication = async (formData: LoanFormData): Promise<string> => {
  try {
    let paysheetUrl = '';
    let paysheetName = '';

    if (formData.paysheet) {
      paysheetName = formData.paysheet.name;
      console.log('Uploading paysheet to Cloudinary:', paysheetName);
      paysheetUrl = await uploadToCloudinary(formData.paysheet.uri, paysheetName);
      console.log('Paysheet uploaded successfully:', paysheetUrl);
    }

    const loanData: Omit<LoanApplication, 'id'> = {
      name: formData.name,
      email: formData.email,
      telephone: formData.telephone,
      occupation: formData.occupation,
      salary: formData.salary,
      paysheetUrl,
      paysheetName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), loanData);
    console.log('Loan application created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting loan application:', error);
    throw error;
  }
};

// --- Read all ---
export const getLoanApplications = async (): Promise<LoanApplication[]> => {
  try {
    console.log('Fetching loan applications from Firestore...');
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const applications: LoanApplication[] = [];
    
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      applications.push({
        id: docSnapshot.id,
        name: data.name,
        email: data.email,
        telephone: data.telephone,
        occupation: data.occupation,
        salary: data.salary,
        paysheetUrl: data.paysheetUrl || '',
        paysheetName: data.paysheetName || '',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
      });
    });

    console.log(`Fetched ${applications.length} applications`);
    return applications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    throw error;
  }
};

// --- Update ---
export const updateLoanApplication = async (id: string, formData: LoanFormData): Promise<void> => {
  try {
    console.log('Updating loan application:', id);
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Application not found');
    }

    const existingData = docSnap.data() as LoanApplication;
    let paysheetUrl = existingData.paysheetUrl || '';
    let paysheetName = existingData.paysheetName || '';

    // Only upload new file if provided
    if (formData.paysheet) {
      console.log('Uploading new paysheet:', formData.paysheet.name);
      paysheetName = formData.paysheet.name;
      paysheetUrl = await uploadToCloudinary(formData.paysheet.uri, paysheetName);
      console.log('New paysheet uploaded:', paysheetUrl);
    }

    const updateData = {
      name: formData.name,
      email: formData.email,
      telephone: formData.telephone,
      occupation: formData.occupation,
      salary: formData.salary,
      paysheetUrl,
      paysheetName,
      updatedAt: new Date(),
    };

    await updateDoc(docRef, updateData);
    console.log('Loan application updated successfully');
  } catch (error) {
    console.error('Error updating loan application:', error);
    throw error;
  }
};

// --- Delete ---
export const deleteLoanApplication = async (id: string): Promise<void> => {
  try {
    console.log('Deleting loan application:', id);
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    console.log('Loan application deleted successfully');
  } catch (error) {
    console.error('Error deleting loan application:', error);
    throw error;
  }
};

// --- Get single ---
export const getLoanApplication = async (id: string): Promise<LoanApplication | null> => {
  try {
    console.log('Fetching single loan application:', id);
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const application = {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        telephone: data.telephone,
        occupation: data.occupation,
        salary: data.salary,
        paysheetUrl: data.paysheetUrl || '',
        paysheetName: data.paysheetName || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as LoanApplication;
      
      console.log('Application fetched successfully');
      return application;
    }
    
    console.log('Application not found');
    return null;
  } catch (error) {
    console.error('Error fetching loan application:', error);
    throw error;
  }
};

// --- Utility functions for PDF handling ---
export const validatePDFUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return url.includes('.pdf') || url.includes('cloudinary.com');
  } catch {
    return false;
  }
};

export const getPDFFileName = (url: string, defaultName: string = 'document.pdf'): string => {
  try {
    if (!url) return defaultName;
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    if (fileName && fileName.includes('.pdf')) {
      return decodeURIComponent(fileName);
    }
    return defaultName;
  } catch {
    return defaultName;
  }
};

// --- Enhanced error handling for PDF operations ---
export const handlePDFError = (error: any, operation: string): void => {
  console.error(`PDF ${operation} error:`, error);
  
  if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    throw new Error('Network error. Please check your internet connection and try again.');
  } else if (error.message?.includes('Permission') || error.message?.includes('denied')) {
    throw new Error('Permission denied. Please check app permissions and try again.');
  } else if (error.message?.includes('Not found') || error.message?.includes('404')) {
    throw new Error('PDF file not found. The file may have been moved or deleted.');
  } else if (error.message?.includes('deprecated')) {
    throw new Error('PDF functionality is being updated. Please try again.');
  } else {
    throw new Error(`Failed to ${operation} PDF. Please try again.`);
  }
};