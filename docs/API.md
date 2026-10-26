# API reference

All endpoints are served by the Express backend under `http://localhost:10000/api`. Bodies are JSON unless noted.
Route files live in [`Backend/Routes`](../Backend/Routes); each handler is in [`Backend/controllers`](../Backend/controllers).

> The API does not enforce authentication yet (login only tells the web app who you are). Treat it as a
> teaching/demo backend and put proper token checks in front of it before any real deployment.

## Account

| Method | Path | What it does |
| --- | --- | --- |
| POST | `/login` | Sign in with `username` + `password`; returns the user's role and id |
| GET | `/logout` | Clear the session cookie |
| POST | `/sendResetEmail` | Email a password-reset link |
| POST | `/changePassword/:id/:token` | Set a new password from the reset link |
| POST | `/changePass/:username` | Change password while signed in (same strength rule as sign-up) |
| GET | `/user/users` | List users (used by chat search) |

## Patient (`/patient`)

| Method | Path | What it does |
| --- | --- | --- |
| POST | `/addPatient` | Register a patient |
| GET / PATCH | `/profile/:patientId` | Read / edit profile (name, email, mobile, birth date, emergency contact) |
| GET | `/patientID/:username` | Look up an id by username |
| GET | `/viewDoctors/:patientId` | Doctors with prices after the patient's plan discount |
| GET | `/getAlldoctors` | All approved doctors |
| GET | `/MyDoctors/:patientId` | Doctors the patient has seen |
| GET | `/freeAppiontmentSlot/:doctorId` | Open times for a doctor |
| PATCH | `/reserveAppointmentSlot/:AppointmentId` | Reserve a time |
| POST | `/createAppointment/:patientID` | Create an appointment |
| POST | `/payAppWithWallet` | Pay for a visit from the wallet |
| GET | `/viewAppoints/:patientId` | The patient's appointments |
| GET | `/patientFilterAppointments` | Filter by date / status |
| PUT | `/rescheduleAppointment/:appointmentId` | Move an appointment |
| PATCH | `/CancelAppointment/:aid/:did/:pid` | Cancel (refunds per the cancellation rule) |
| POST | `/requestFollowUp/:pid/:did` | Ask a doctor for a follow-up visit |
| POST / GET | `/addFamilyMember/:patientId`, `/viewFamilyMembers/:patientId` | Family members |
| PATCH / DELETE | `/familyMember/:patientId/:familyIndex` | Edit / remove a family member |
| POST | `/addFamilyLink/:patientId` | Link an existing account as family |
| GET | `/viewHealthPackagesPatient/:patientId` | Plans, with the patient's current one |
| PATCH | `/subscribeToHealthPackage`, `/unSubscribeToHealthPackage` | Join / leave a plan |
| PATCH | `/SubscriptionPayment/:patientId/:healthPackageId` | Pay for a plan from the wallet |
| GET | `/viewPrescriptions/:patientId` | Prescriptions with doctor and medicine details |
| GET | `/viewSpecificPrescription/:id` | One prescription |
| POST | `/payPrescriptionWithWallet/:prescriptionId/:patientId` | Pay for medicines from the wallet |
| GET | `/viewPatientHealthRecords/:patientid` | Health records |
| POST / GET | `/upload/:id`, `/getAllFiles/:id` | Upload a medical document (multipart) / list them |
| GET | `/download/:id/:pid`, `/delete/:id/:pid` | Download / delete a document |
| GET | `/viewWallet/:patientId` | Balance and transaction history |
| GET | `/:patientId/notifications` | Notifications |
| PATCH | `/:patientId/notifications/seen-all`, `/:patientId/notifications/:notificationId/seen` | Mark as read |

### Card payments (Stripe Checkout)

| Method | Path | What it does |
| --- | --- | --- |
| POST | `/patient/checkout/visit` | Start a Checkout session for a visit. The price is computed on the server |
| POST | `/patient/checkout/plan` | Start a Checkout session for a plan |
| GET | `/patient/checkout/confirm/:sessionId` | Verify a returned session with Stripe and fulfil it (idempotent) |
| POST | `/stripe/webhook` | Stripe's `checkout.session.completed` event (raw body, signature checked) |

## Doctor (`/doctor`)

| Method | Path | What it does |
| --- | --- | --- |
| POST | `/addDoctor` | Apply as a doctor (multipart with documents) |
| GET | `/getDoctor/:doctorId`, `/getDr/:id` | Profile |
| PUT | `/editDoctor/:id` | Edit rate, hospital, email |
| GET | `/publicProfile/:username` | Public profile |
| GET / PUT | `/getContract/:id`, `/acceptContract/:doctorId` | Employment contract |
| POST | `/addAppointmentSlot/:doctorId` | Publish an open time |
| GET | `/doctorFilterAppointments/:doctorId` | Appointments, filterable |
| PUT | `/rescheduleAppointment/:appointmentId` | Move an appointment |
| PATCH | `/CancelAppointment/:aid/:did/:pid` | Cancel |
| GET | `/getPatients/:id`, `/Mypatients/:doctorId`, `/getPatientsByDoctorId/:doctorId` | Patients |
| GET | `/searchPatientByName` | Search patients |
| POST | `/addHealthRecord/:patientID` | Add a health record |
| POST | `/addPrescription` | Write a prescription |
| POST / PUT / DELETE | `/add/:prescriptionID`, `/update/:prescriptionID`, `/delete/:prescriptionID/:medID` | Edit medicines on an unpaid prescription |
| GET | `/viewPrescriptions/:patientId` | A patient's prescriptions |
| GET | `/FollowUpRequests/:doctorId` | Pending follow-up requests |
| POST / DELETE | `/acceptFollowUp/:id`, `/rejectFollowUp/:id` | Answer a request |
| POST | `/createFollowUpAppointment/:drID` | Book a follow-up directly |
| GET | `/viewWallet/:doctorId` | Wallet and earnings |
| GET | `/:doctorId/notifications` | Notifications (same shape as the patient's) |

## Administrator (`/admin`)

Accounts, doctor applications, plans and the medicine catalogue: `viewPendDr`, `viewJoinedDr`, `viewPatients`,
`deletePatient|Doctor|Admin/:id`, `createAdmin`, `addPack`, `updatePack/:id`, `deletePack/:id`, `viewHealthP`,
`viewMedicine`, `sendAcceptEmail`, `sendRejectEmail`.

## Chat (`/chat`, `/message`)

| Method | Path | What it does |
| --- | --- | --- |
| POST | `/chat` | Open (or find) a one-to-one chat |
| GET | `/chat/:id` | A user's chats |
| POST / PUT | `/chat/group`, `/chat/rename`, `/chat/groupadd`, `/chat/groupremove` | Group chats |
| GET | `/message/:chatId` | Messages in a chat |
| POST | `/message` | Send a message (also pushed over Socket.IO) |
