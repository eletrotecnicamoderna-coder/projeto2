# Security Specification - MedSync

## Data Invariants
1. A Professional user is created with `status: 'pending'` by default if registering normally.
2. Admins are the only ones who can change a user's `status`.
3. Appointments created by patients are `status: 'pending'`.
4. Only admins can confirm (set to `scheduled`) a pending appointment.
5. Professionals can only update `diagnosis` and `prescription` of an appointment assigned to them.
6. Patients and Professionals can only see their own data or data related to them.

## The Dirty Dozen Payloads (Target: DENY)
1. **Identity Spoofing**: Patient A trying to update Patient B's profile.
2. **Privilege Escalation**: Professional setting their own `status` to `active`.
3. **Orphaned Write**: Creating an appointment for a patient ID that doesn't exist.
4. **State Shortcutting**: Patient creating a `scheduled` appointment directly.
5. **PII Leak**: Guest reading a user's profile.
6. **Shadow Field**: Adding `isAdmin: true` to a user document.
7. **Resource Poisoning**: Use a 2MB string as a `notes` field.
8. **Invalid CRM**: Professional registering with CRM longer than 100 chars.
9. **Role Swap**: Patient trying to set their role to `admin`.
10. **Diagnosis Sabotage**: Patient trying to update their own `diagnosis`.
11. **Future Date Injection**: (Handled by app logic, but rules should restrict crazy dates if possible, though rules are limited for dates).
12. **Status Lock Break**: Trying to update a `completed` appointment.

## Test Runner (firestore.rules.test.ts)
... (Would contain tests normally, but I'll focus on the rules logic)
