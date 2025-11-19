# Grade Verification Runbook

This document explains how admins can verify that the grade a seller claims (“Karakter”) actually matches the uploaded dokument. The goal is to keep trust high in the marketplace without overloading the workflow.

## Data Model Recap

- `documents.grade`: string (`A`–`F`) chosen by selger.
- `documents.grade_proof_url`: optional URL to a screenshot/PDF from Studentweb, Vitnemålsportalen, etc.
- `documents.grade_verified`: boolean (defaults `false`). When `true`, UI badges switch from “venter på verifisering” clock to a solid checkmark.

To flip `grade_verified`, you need to inspect proof manually and update the row in Supabase.

## Verification Workflow

1. **Identify submissions**
   - Use Supabase SQL:
     ```sql
     select id, title, grade, grade_proof_url, inserted_at
     from documents
     where grade is not null
       and grade_verified = false
     order by inserted_at asc;
     ```
   - Alternatively, build an admin UI/table view later using the same query.

2. **Review proof**
   - Open `grade_proof_url` in a new tab. Ask the seller to upload via a trusted link (e.g., Google Drive, Supabase Storage, or Vitnemålsportalen share link).
   - Check that the document displays:
     - Student name (optional but nice to corroborate with profile).
     - Course code or course title.
     - Semester/year.
     - Grade letter matching their claim.
   - If link is broken or insufficient, email seller (or use in-app messaging once available) to request a better screenshot.

3. **Update verified status**
   - Run SQL in Supabase SQL Editor:
     ```sql
     update documents
     set grade_verified = true,
         grade_verified_at = now() -- optional column if added later
     where id = 'document-id-here';
     ```
   - Consider storing `grade_verified_by` (UUID) if you want audit trails. Add columns when needed.

4. **Communicate**
   - Notify seller (email or future notification) that their grade is verified.
   - If rejected, explain why and what proof is missing.

## Automation Ideas (Future)

- **Webhook ingestion**: Require uploads to Supabase Storage and let admins view thumbnails inline.
- **OCR/Metadata**: Use OCR to detect course codes/grades automatically for faster pre-screening.
- **Admin Dashboard**: Build a `/admin/grades` route listing pending verifications with approve/reject buttons (calls Supabase RPC to set `grade_verified`).
- **Audit Trail**: Add `grade_verified_by` + `grade_verified_at` columns to track who verified when.

## Security Considerations

- Only admin-role users should be able to toggle `grade_verified`. If using Supabase RLS:
  - Create a `profiles.role` column or use Supabase auth roles.
  - Add a policy allowing updates to `grade_verified` only when `auth.jwt() ->> 'role' = 'admin'`.
- Ensure proof links are viewable; if private, ask sellers to grant access or upload into a shared admin bucket.

## FAQ

**What if no proof is provided?**  
Keep `grade_verified = false`. The UI already shows “venter på verifisering,” so buyers know the grade isn’t approved yet.

**What if someone fakes a screenshot?**  
Request additional proof or contact the university if necessary. Remind sellers that fraudulent grades violate terms and can lead to account suspension.

**How often should we verify?**  
Best practice: run through pending submissions daily or weekly depending on volume. Add automation/notifications to avoid backlog.

Keep this runbook updated as the verification flow evolves (e.g., when an admin dashboard ships or when automated checks are introduced).

