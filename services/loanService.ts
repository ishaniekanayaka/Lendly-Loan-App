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
    type: "application/pdf", // or "image/jpeg" if images
    name: fileName,
  } as any);

  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error("Cloudinary upload failed: " + errorText);
  }

  const data = await uploadResponse.json();
  return data.secure_url;
};


// --- Create ---
export const submitLoanApplication = async (formData: LoanFormData): Promise<string> => {
  try {
    let paysheetUrl = '';
    let paysheetName = '';

    if (formData.paysheet) {
      paysheetName = formData.paysheet.name;
      paysheetUrl = await uploadToCloudinary(formData.paysheet.uri, paysheetName);
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
    return docRef.id;
  } catch (error) {
    console.error('Error submitting loan application:', error);
    throw error;
  }
};

// --- Read all ---
export const getLoanApplications = async (): Promise<LoanApplication[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const applications: LoanApplication[] = [];
    
    querySnapshot.forEach((docSnapshot) => {
      applications.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnapshot.data().updatedAt?.toDate() || new Date(),
      } as LoanApplication);
    });

    return applications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    throw error;
  }
};

// --- Update ---
export const updateLoanApplication = async (id: string, formData: LoanFormData): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Application not found');
    }

    const existingData = docSnap.data() as LoanApplication;
    let paysheetUrl = existingData.paysheetUrl || '';
    let paysheetName = existingData.paysheetName || '';

    if (formData.paysheet) {
      paysheetName = formData.paysheet.name;
      paysheetUrl = await uploadToCloudinary(formData.paysheet.uri, paysheetName);
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
  } catch (error) {
    console.error('Error updating loan application:', error);
    throw error;
  }
};

// --- Delete ---
export const deleteLoanApplication = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting loan application:', error);
    throw error;
  }
};

// --- Get single ---
export const getLoanApplication = async (id: string): Promise<LoanApplication | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as LoanApplication;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching loan application:', error);
    throw error;
  }
};
