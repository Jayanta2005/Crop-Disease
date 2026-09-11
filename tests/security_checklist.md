# CropGuard AI - Security Review & Compliance Checklist

## 1. Authentication & Role-Based Access Control (RBAC)
- [x] **User Role Segmentation:** Enforced strictly across 5 roles: `FARMER`, `EXTENSION_WORKER`, `EXPERT`, `LAB_STAFF`, `ADMIN`.
- [x] **Farmer Data Isolation:** Farmers can only access and query diagnoses belonging to their designated `farmerId`. Cross-tenant queries are blocked.
- [x] **Privileged Verification Gate:** Only users with `role: EXPERT` or `role: ADMIN` can execute `POST /diagnosis/:id/expert-review`.
- [x] **Laboratory Workstation Security:** Only `LAB_STAFF` can submit confirmed pathogen microbiological cultures or update sample barcodes.

## 2. Input Validation & API Protection
- [x] **Payload Sanitization:** Form bodies and JSON payloads are validated against strict schema typings.
- [x] **SQL Injection Defense:** All queries utilize parameterized queries (`$1`, `$2`) or strongly typed in-memory document structures.
- [x] **Cross-Site Scripting (XSS):** React 19 JSX auto-escapes rendered content. Multilingual dictionaries contain sanitized UTF-8 strings.
- [x] **CORS Configuration:** Restricted to authorized domain origins with credential support.

## 3. Secure File & Image Upload
- [x] **MIME Type Validation:** Uploads are strictly verified against whitelist: `image/jpeg`, `image/png`, `image/webp`. Executable scripts and SVGs are rejected.
- [x] **File Size Capping:** Uploads are capped at 10 MB per image to prevent denial-of-service memory exhaustion.
- [x] **Client-Side Compression:** Images are compressed via HTML5 Canvas before network transmission, reducing payload size by up to 80% on 2G/3G networks.

## 4. Pesticide & Advisory Safety
- [x] **Zero AI Hallucination for Chemicals:** The AI system is strictly forbidden from inventing chemical formulations or dosages.
- [x] **CIBRC Authoritative Knowledge Base:** All chemical recommendations originate from a verified static database referencing Central Insecticide Board & Registration Committee (CIBRC) approvals, exact dilution rates per liter, Pre-Harvest Intervals (PHI), and Mandatory PPE.

## 5. Audit Logging & Non-Repudiation
- [x] **Audit Log Entity:** All expert diagnosis confirmations, corrections, and laboratory pathogen results record `actor_user_id`, `timestamp`, `ip_address`, and before/after states.
