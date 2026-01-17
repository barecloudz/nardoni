// =====================================================
// MARKETING EMAIL SYSTEM - REACT STATE & FUNCTIONS
// Copy these into your React admin component
// =====================================================

// ==================== STATE VARIABLES ====================
// Add these inside your component function

// Email Form State
const [emailForm, setEmailForm] = useState({
  to: '',
  subject: '',
  body: '',
  attachments: [],
  useHtmlTemplate: false
});
const [emailSending, setEmailSending] = useState(false);
const [emailError, setEmailError] = useState('');
const [emailSuccess, setEmailSuccess] = useState('');
const [emailAttachmentPreviews, setEmailAttachmentPreviews] = useState([]);
const [sentEmails, setSentEmails] = useState([]);
const [sentEmailsLoading, setSentEmailsLoading] = useState(false);

// Email Scheduling State
const [isScheduled, setIsScheduled] = useState(false);
const [scheduledDateTime, setScheduledDateTime] = useState('');
const [scheduledEmails, setScheduledEmails] = useState([]);
const [scheduledEmailsLoading, setScheduledEmailsLoading] = useState(false);

// Contact Management State
const [contacts, setContacts] = useState([]);
const [contactLists, setContactLists] = useState([]);
const [contactListsLoading, setContactListsLoading] = useState(false);
const [selectedList, setSelectedList] = useState(null);
const [selectedListForSend, setSelectedListForSend] = useState(null);
const [sendMode, setSendMode] = useState('single'); // 'single' | 'list'

// Mass Email Progress
const [massEmailProgress, setMassEmailProgress] = useState({ current: 0, total: 0, sending: false });


// ==================== FUNCTIONS ====================

// Load all contacts
const loadContacts = async () => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setContacts(data || []);
  } catch (err) {
    console.error('Error loading contacts:', err);
  }
};

// Load contact lists
const loadContactLists = async () => {
  setContactListsLoading(true);
  try {
    const { data, error } = await supabase
      .from('contact_lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setContactLists(data || []);
  } catch (err) {
    console.error('Error loading contact lists:', err);
  } finally {
    setContactListsLoading(false);
  }
};

// Load contacts in a specific list
const loadListContacts = async (listId) => {
  try {
    const { data, error } = await supabase
      .from('contact_list_members')
      .select(`
        id,
        added_at,
        contacts (*)
      `)
      .eq('list_id', listId);

    if (error) throw error;
    return (data || []).map(item => ({ ...item.contacts, membership_id: item.id, added_at: item.added_at }));
  } catch (err) {
    console.error('Error loading list contacts:', err);
    return [];
  }
};

// Load sent emails history
const loadSentEmails = async () => {
  setSentEmailsLoading(true);
  try {
    const { data, error } = await supabase
      .from('sent_emails')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    setSentEmails(data || []);
  } catch (err) {
    console.error('Error loading sent emails:', err);
  } finally {
    setSentEmailsLoading(false);
  }
};

// Load scheduled emails
const loadScheduledEmails = async () => {
  setScheduledEmailsLoading(true);
  try {
    const { data, error } = await supabase
      .from('scheduled_emails')
      .select('*, contact_lists(name)')
      .in('status', ['pending', 'sending'])
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    setScheduledEmails(data || []);
  } catch (err) {
    console.error('Error loading scheduled emails:', err);
  } finally {
    setScheduledEmailsLoading(false);
  }
};

// Cancel a scheduled email
const cancelScheduledEmail = async (id) => {
  try {
    const { error } = await supabase
      .from('scheduled_emails')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
    setScheduledEmails(prev => prev.filter(e => e.id !== id));
    setEmailSuccess('Scheduled email cancelled');
    setTimeout(() => setEmailSuccess(''), 3000);
  } catch (err) {
    console.error('Error cancelling scheduled email:', err);
    setEmailError('Failed to cancel scheduled email');
  }
};

// Schedule an email
const scheduleEmail = async (emailData) => {
  try {
    const { error } = await supabase
      .from('scheduled_emails')
      .insert([emailData]);

    if (error) throw error;
    loadScheduledEmails();
    return true;
  } catch (err) {
    console.error('Error scheduling email:', err);
    throw err;
  }
};

// Send mass email to a contact list
const sendMassEmail = async (listId) => {
  if (!emailForm.subject || !emailForm.body) {
    setEmailError('Please fill in subject and message');
    return;
  }

  const listContacts = await loadListContacts(listId);
  if (listContacts.length === 0) {
    setEmailError('No contacts in this list');
    return;
  }

  setMassEmailProgress({ current: 0, total: listContacts.length, sending: true });
  setEmailError('');
  setEmailSuccess('');

  let successCount = 0;
  let failCount = 0;

  // Separate small files (base64) from large files (upload to storage)
  const SIZE_THRESHOLD = 500 * 1024; // 500KB
  const attachments = emailForm.attachments || [];
  const smallFiles = attachments.filter(f => f.size <= SIZE_THRESHOLD);
  const largeFiles = attachments.filter(f => f.size > SIZE_THRESHOLD);

  // Convert small files to base64
  const attachmentsBase64 = await Promise.all(
    smallFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          filename: file.name,
          content: reader.result.split(',')[1],
          type: file.type
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })
  );

  // Upload large files to Supabase storage (reuse existing files)
  const attachmentUrls = [];
  for (const file of largeFiles) {
    try {
      const fileKey = `${file.name}-${file.size}`;
      const fileName = `email-attachments/${fileKey}`;

      // Check if file already exists
      const { data: existingFile } = await supabase.storage
        .from('marketing')
        .list('email-attachments', { search: fileKey });

      if (existingFile && existingFile.length > 0) {
        setEmailSuccess(`Using cached ${file.name}`);
        const { data: urlData } = supabase.storage.from('marketing').getPublicUrl(fileName);
        attachmentUrls.push({ filename: file.name, url: urlData.publicUrl, type: file.type });
      } else {
        setEmailSuccess(`Uploading ${file.name}...`);
        const { error } = await supabase.storage
          .from('marketing')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (error) {
          console.error('Error uploading:', error);
          continue;
        }

        const { data: urlData } = supabase.storage.from('marketing').getPublicUrl(fileName);
        attachmentUrls.push({ filename: file.name, url: urlData.publicUrl, type: file.type });
        setEmailSuccess(`Uploaded ${file.name}!`);
      }
    } catch (err) {
      console.error('Error uploading file:', file.name, err);
    }
  }

  if (largeFiles.length > 0 && attachmentUrls.length === 0) {
    setEmailError('Failed to upload attachments');
    setMassEmailProgress({ current: 0, total: 0, sending: false });
    return;
  }

  setEmailSuccess('Attachments ready. Sending emails...');
  setEmailError('');

  // Send to each contact
  for (let i = 0; i < listContacts.length; i++) {
    const contact = listContacts[i];
    setMassEmailProgress(prev => ({ ...prev, current: i + 1 }));

    try {
      const payload = {
        to: contact.email,
        subject: emailForm.subject,
        body: emailForm.body
          .replace(/\[Name\]/g, (contact.name || 'there').split(' ')[0])
          .replace(/\[Company\]/g, contact.company || '')
          .replace(/\[Role\]/g, contact.role || ''),
        attachments: attachmentsBase64,
        attachmentUrls: attachmentUrls,
        useHtmlTemplate: emailForm.useHtmlTemplate
      };

      const response = await fetch('/.netlify/functions/send-marketing-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', response.status, text.substring(0, 500));
        result = { error: text.substring(0, 200) };
      }

      if (response.ok) {
        successCount++;
        await supabase.from('sent_emails').insert([{
          recipient_email: contact.email,
          subject: emailForm.subject,
          body: payload.body,
          used_html_template: emailForm.useHtmlTemplate,
          attachment_count: emailForm.attachments.length,
          attachment_names: emailForm.attachments.map(f => f.name),
          status: 'sent',
          resend_id: result.id || null
        }]);
      } else {
        failCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      console.error('Email send error for', contact.email, ':', err.message);
      failCount++;
    }
  }

  setMassEmailProgress({ current: 0, total: 0, sending: false });
  loadSentEmails();

  // Clear form
  setEmailForm({ to: '', subject: '', body: '', attachments: [], useHtmlTemplate: false });
  setEmailAttachmentPreviews([]);

  if (failCount === 0) {
    setEmailSuccess(`Successfully sent ${successCount} emails!`);
  } else {
    setEmailSuccess(`Sent ${successCount} emails. ${failCount} failed.`);
  }
  setTimeout(() => setEmailSuccess(''), 5000);
};

// Create a new contact list
const createContactList = async (name, description) => {
  try {
    const { data, error } = await supabase
      .from('contact_lists')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;
    loadContactLists();
    return data;
  } catch (err) {
    console.error('Error creating list:', err);
    throw err;
  }
};

// Add contact to a list
const addContactToList = async (contactId, listId) => {
  try {
    const { error } = await supabase
      .from('contact_list_members')
      .upsert({ contact_id: contactId, list_id: listId });

    if (error) throw error;

    // Update member count
    await supabase
      .from('contact_lists')
      .update({ member_count: (await loadListContacts(listId)).length })
      .eq('id', listId);

    loadContactLists();
  } catch (err) {
    console.error('Error adding contact to list:', err);
  }
};
