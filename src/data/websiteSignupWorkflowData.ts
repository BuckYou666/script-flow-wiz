import { WorkflowNode } from "@/types/workflow";

export const websiteSignupWorkflowData: WorkflowNode[] = [
  // ENTRY POINT
  {
    node_id: "WEBSITE_SIGNUP_START",
    parent_id: "START",
    stage: "Source",
    scenario_title: "Website Signup Lead",
    scenario_description: "Lead came through the website — they've shown interest but may not fully understand what Local AI is. Assume mild awareness, moderate curiosity, and a need for clarity.",
    script_name: "Website Signup Script",
    script_section: "Entry Point",
    script_content: "Lead Source: Website Signup\nLead Magnet: {lead_magnet_name} (\"Local AI System Demo\" or \"AI Automation Consultation\")\n\nThe lead came through the website — they've shown interest but may not fully understand what Local AI is. Assume mild awareness, moderate curiosity, and a need for clarity.",
    crm_actions: "Review lead magnet submitted. Check contact details and business name.",
    workflow_name: "Website Signup Workflow",
    display_order: 1
  },

  // CONTACT METHOD CHOICE
  {
    node_id: "CONTACT_METHOD_CHOICE",
    parent_id: "WEBSITE_SIGNUP_START",
    stage: "First Contact",
    scenario_title: "Choose Contact Method",
    scenario_description: "Decide how to reach out to this website signup lead",
    script_name: "Website Signup Script",
    script_section: "Contact Method",
    script_content: "First Choice: How will you contact the lead?\n\nOption 1: Call\nOption 2: Text Message",
    on_yes_next_node: "INTRO_STAGE_CALL",
    on_no_next_node: "INTRO_STAGE_TEXT",
    crm_actions: "Select contact method and proceed to appropriate workflow path",
    workflow_name: "Website Signup Workflow",
    display_order: 2
  },

  // ========== CALL PATH ==========
  
  // INTRO STAGE - CALL
  {
    node_id: "INTRO_STAGE_CALL",
    parent_id: "CONTACT_METHOD_CHOICE",
    stage: "First Contact",
    scenario_title: "Introduction Call",
    scenario_description: "Initial phone greeting and time check with website signup lead",
    script_name: "Website Signup Script",
    script_section: "Call Path - Intro",
    script_content: "\"Hey, is this {LeadFirstName}?\"\n(wait for response)\n\n\"Yeah, this is {RepName} from A-Tech Technologies. You'd entered your details through our website earlier about {lead_magnet_name} — I just wanted to reach out and connect with you directly about that. How've you been?\"\n(wait for response)\n\n\"Got it. Is now a terrible time for a quick chat?\"",
    on_yes_next_node: "BAMFAM_STAGE_CALL",
    on_no_next_node: "DISCOVERY_STAGE_CALL",
    crm_actions: "Log call attempt. Record response to time check.",
    workflow_name: "Website Signup Workflow",
    display_order: 3
  },

  // BAMFAM - RESCHEDULE CALL
  {
    node_id: "BAMFAM_STAGE_CALL",
    parent_id: "INTRO_STAGE_CALL",
    stage: "Follow-Up",
    scenario_title: "Reschedule Call (Bad Time)",
    scenario_description: "Lead indicates now is a bad time - schedule callback",
    script_name: "Website Signup Script",
    script_section: "Call Path - BAMFAM",
    script_content: "\"No problem at all — when's a better time to call you back?\"\n\n(Wait for callback time)",
    crm_actions: "Update CRM: status = Interested – Call Back Scheduled\nCreate Task: follow-up at {callback_time}\nInput Field: callback_time",
    workflow_name: "Website Signup Workflow",
    display_order: 4
  },

  // DISCOVERY STAGE - CALL
  {
    node_id: "DISCOVERY_STAGE_CALL",
    parent_id: "INTRO_STAGE_CALL",
    stage: "Appointment",
    scenario_title: "Discovery Questions (Call)",
    scenario_description: "Qualify the lead - confirm decision maker status and understand their interest",
    script_name: "Website Signup Script",
    script_section: "Call Path - Discovery",
    script_content: "\"Great, so you're the owner at {BusinessName}, right?\"\n(wait)\n\nIf Response = \"No\" →\n\"No worries — do you also make decisions when it comes to operations, AI systems, or automation?\"\n(wait)\nIf Still \"No\" → Route to BAMFAM\nIf \"Yes\" → Continue\n\nContinue Script:\n\"I was just curious — what had you checking out {lead_magnet_name} on the website?\"\n(wait)\n\n\"Were you mainly looking to improve your local AI setup, or just seeing what's possible right now?\"\n(wait)\n\n\"Makes sense. And how are you handling things at the moment — are you already using any AI tools, or would this be your first time building something local or custom?\"\n(wait)",
    on_yes_next_node: "FOCUS_QUESTION_STAGE_CALL",
    on_no_next_node: "BAMFAM_STAGE_CALL",
    crm_actions: "Log decision maker status. Record current AI tool usage. Note interest drivers.",
    workflow_name: "Website Signup Workflow",
    display_order: 5
  },

  // FOCUS QUESTION STAGE - CALL
  {
    node_id: "FOCUS_QUESTION_STAGE_CALL",
    parent_id: "DISCOVERY_STAGE_CALL",
    stage: "Pre-Call",
    scenario_title: "Focus Question (Call)",
    scenario_description: "Identify the lead's primary business focus for the next quarter",
    script_name: "Website Signup Script",
    script_section: "Call Path - Focus",
    script_content: "\"If you were to look at your business over the next quarter or two, what would you say is the biggest focus point for you right now?\"\n(wait)\n\n\"Would you say it's more about improving how things run internally, generating more opportunities, or freeing up time to focus on growth?\"\n(wait)",
    on_yes_next_node: "PROBLEM_MAPPING_STAGE_CALL",
    crm_actions: "Record primary business focus. Tag focus category (internal ops / lead gen / time management).",
    workflow_name: "Website Signup Workflow",
    display_order: 6
  },

  // PROBLEM MAPPING STAGE - CALL
  {
    node_id: "PROBLEM_MAPPING_STAGE_CALL",
    parent_id: "FOCUS_QUESTION_STAGE_CALL",
    stage: "Pre-Call",
    scenario_title: "Problem Mapping (Call)",
    scenario_description: "Map out specific pain points and prioritize the biggest constraint",
    script_name: "Website Signup Script",
    script_section: "Call Path - Problem Mapping",
    script_content: "If Single Issue:\n\"So it sounds like it's {problem_summary}, so it's a {chunk_up_problem}, yeah?\"\n\nIf Multiple Issues:\n\"Sounds like a few things going on — maybe something like:\"\n[Problem 1]\n[Problem 2]\n[Problem 3]\n\"Did I get that right?\"\n\nThen:\n\"So it sounds like you're dealing with a few things — maybe you're not generating consistent leads or automating follow-up (marketing constraint), or your internal workflows aren't streamlined yet (process constraint), or you're not seeing ROI from your AI tools (strategy constraint). Does that sound about right?\"\n(wait)\n\n\"If you could only tackle one of those, which one would make the biggest difference for your business?\"\n(wait)",
    on_yes_next_node: "DEEPER_DISCOVERY_STAGE_CALL",
    crm_actions: "Log identified problems. Tag constraint type. Record top priority problem.",
    workflow_name: "Website Signup Workflow",
    display_order: 7
  },

  // DEEPER DISCOVERY STAGE - CALL
  {
    node_id: "DEEPER_DISCOVERY_STAGE_CALL",
    parent_id: "PROBLEM_MAPPING_STAGE_CALL",
    stage: "Pre-Call",
    scenario_title: "Deeper Discovery (Call)",
    scenario_description: "Deep dive into the priority problem with qualification questions",
    script_name: "Website Signup Script",
    script_section: "Call Path - Deeper Discovery",
    script_content: "Sequential Questions (each waits for response before next unlocks):\n\n1. \"Can you tell me a bit more about that — what's been the main challenge there?\"\n\n2. \"And what have you tried so far to solve it?\"\n\n3. \"So why now — why is this something that's important to solve at this point?\"\n\n4. \"If you did get this sorted, what would that unlock for you or the business?\"\n\n5. \"How long has that been a challenge for you?\"\n\n6. \"Is this something you'd be open to getting outside help with?\"\n\nTransition Script:\n\"So, we work with businesses like yours to solve {problem_summary} through our Local AI systems, automation builds, and on-prem hardware setups. Roughly how big is your team right now — or who's typically managing that part of the operation?\"\n(wait)\n\n\"And how are you currently running that side — mostly manual or do you already have some systems in place?\"\n(wait)\n\n\"How much have you heard about A-Tech's Local AI systems and equipment?\"\n(wait)\n\n\"From what you've told me, it sounds like one of our setups could actually help with this. Mind if I share a bit more?\"\n(wait)",
    on_yes_next_node: "OFFER_STAGE_CALL",
    crm_actions: "Log all discovery answers. Record team size, current systems, pain severity, timeline urgency. Tag: Qualified for Offer.",
    workflow_name: "Website Signup Workflow",
    display_order: 8
  },

  // OFFER STAGE - CALL
  {
    node_id: "OFFER_STAGE_CALL",
    parent_id: "DEEPER_DISCOVERY_STAGE_CALL",
    stage: "Close",
    scenario_title: "Present Offer (Call)",
    scenario_description: "Present the consultation offer and value proposition",
    script_name: "Website Signup Script",
    script_section: "Call Path - Offer",
    script_content: "\"So, at a high level, you'd get to work with our A-Tech team that helps businesses implement Local AI systems, automations, and custom setups that solve exactly what we've talked about. For you specifically, you'll have a chance to ask tactical questions directly to one of our specialists who builds these systems every day. They'll help identify the exact AI or hardware setup that fits your business goals. The goal is that you leave with three to five tactical takeaways you can implement right away. Sound good?\"",
    on_yes_next_node: "BOOKING_STAGE_CALL",
    on_no_next_node: "OBJECTION_HANDLING_STAGE_CALL",
    crm_actions: "Present offer. Record initial response.",
    workflow_name: "Website Signup Workflow",
    display_order: 9
  },

  // OBJECTION HANDLING STAGE - CALL
  {
    node_id: "OBJECTION_HANDLING_STAGE_CALL",
    parent_id: "OFFER_STAGE_CALL",
    stage: "Objection",
    scenario_title: "Handle Objections (Call)",
    scenario_description: "Address concerns and overcome objections before returning to offer",
    script_name: "Website Signup Script",
    script_section: "Call Path - Objections",
    script_content: "Display Options:\n\n1. \"Need more info\" → Provide additional details about the consultation format and value\n\n2. \"Already have a system\" → \"That's great you have something in place. This consultation is about optimizing what you have or identifying gaps. Even established businesses find value in seeing what's new in Local AI.\"\n\n3. \"Not ready right now\" → \"I totally understand. When would be a better time to revisit this? What would need to change for this to become a priority?\"\n\nAfter handling → return to offer_stage_call",
    on_yes_next_node: "OFFER_STAGE_CALL",
    crm_actions: "Log objection type and response. Tag: Objection Handled. Return to offer presentation.",
    workflow_name: "Website Signup Workflow",
    display_order: 10
  },

  // BOOKING STAGE - CALL
  {
    node_id: "BOOKING_STAGE_CALL",
    parent_id: "OFFER_STAGE_CALL",
    stage: "Close",
    scenario_title: "Book Appointment (Call)",
    scenario_description: "Schedule the consultation call with time zone confirmation",
    script_name: "Website Signup Script",
    script_section: "Call Path - Booking",
    script_content: "\"So let's do this — I can set up a 20-minute chat with one of our consultants to walk you through everything and see if it's a fit. What time zone are you in?\"\n(wait)\n\nShow available time slots (Calendly or CRM integration)\n\"Would tomorrow morning or afternoon be better?\"\n(wait)\n\nIf neither works:\n\"No worries — I might have a little time later this week too. Would morning or afternoon be better?\"\n(wait)\n\nConfirm:\n\"Can you be in a quiet spot, ideally in front of a computer, for that call?\"\n(wait)\n\n\"Other than something crazy coming up, is there any reason you wouldn't be able to make it?\"",
    on_yes_next_node: "FINAL_CLOSE_STAGE_CALL",
    crm_actions: "Update CRM: status = Booked\nAssign Closer: {CloserName}\nCreate Event: {AppointmentTime}\nLog time zone and availability",
    workflow_name: "Website Signup Workflow",
    display_order: 11
  },

  // FINAL CLOSE STAGE - CALL
  {
    node_id: "FINAL_CLOSE_STAGE_CALL",
    parent_id: "BOOKING_STAGE_CALL",
    stage: "Outcome",
    scenario_title: "Final Close & Confirmation (Call)",
    scenario_description: "Confirm appointment details, share pre-call video, and close the conversation",
    script_name: "Website Signup Script",
    script_section: "Call Path - Final Close",
    script_content: "\"Perfect. I'm going to set you up with {CloserName} — they're one of our A-Tech business consultants and a great person to work with. And by the way, is this a number I can text?\"\n(if yes continue, if no request correct number)\n\n\"I've also got a quick video that walks through how our Local AI systems and hardware work — it'll save a ton of time on the call. Would you mind checking that out beforehand?\"\n(if yes send link, if no explain benefit)\n\n\"Perfect, I'll text that over to you. You're all set to speak with {CloserName} on {AppointmentDate}. Anything else you need from me?\"\n(wait)\n\n\"Awesome — we'll send the details through shortly. Talk soon.\"",
    crm_actions: "Send SMS confirmation with meeting link + video\nSend email confirmation\nNotify Closer (Slack or internal CRM)\nTag contact: Qualified – Booked Call\nAutomation: trigger confirmation workflow",
    workflow_name: "Website Signup Workflow",
    display_order: 12
  },

  // ========== TEXT MESSAGE PATH ==========
  
  // INTRO STAGE - TEXT
  {
    node_id: "INTRO_STAGE_TEXT",
    parent_id: "CONTACT_METHOD_CHOICE",
    stage: "First Contact",
    scenario_title: "Introduction Text",
    scenario_description: "Initial SMS outreach to website signup lead",
    script_name: "Website Signup Script",
    script_section: "Text Path - Intro",
    script_content: "Hey {LeadFirstName}, it's {RepName} from A-Tech Technologies. You filled out our form on the website about {lead_magnet_name} — just wanted to check if you were still interested in learning how our Local AI systems could help your business?",
    on_yes_next_node: "DISCOVERY_STAGE_TEXT",
    on_no_next_node: "FOLLOW_UP_DECLINE_TEXT",
    on_no_response_next_node: "DISCOVERY_STAGE_TEXT",
    crm_actions: "Send SMS. Log message sent. Track response status.",
    workflow_name: "Website Signup Workflow",
    display_order: 13
  },

  // DISCOVERY STAGE - TEXT
  {
    node_id: "DISCOVERY_STAGE_TEXT",
    parent_id: "INTRO_STAGE_TEXT",
    stage: "Appointment",
    scenario_title: "Discovery Questions (Text)",
    scenario_description: "Quick qualification questions via text message",
    script_name: "Website Signup Script",
    script_section: "Text Path - Discovery",
    script_content: "Got it — no problem. Quick question: were you mainly looking to improve your current systems or just seeing what's possible with Local AI right now?\n\n(wait for reply)\n\nMakes sense. And are you already using any AI tools, or would this be your first time building something more custom or local?\n\n(wait for reply)",
    on_yes_next_node: "OFFER_STAGE_TEXT",
    crm_actions: "Log text responses. Record interest level and current AI usage.",
    workflow_name: "Website Signup Workflow",
    display_order: 14
  },

  // OFFER STAGE - TEXT
  {
    node_id: "OFFER_STAGE_TEXT",
    parent_id: "DISCOVERY_STAGE_TEXT",
    stage: "Close",
    scenario_title: "Present Offer (Text)",
    scenario_description: "Offer the consultation via text message",
    script_name: "Website Signup Script",
    script_section: "Text Path - Offer",
    script_content: "Based on what you mentioned, it sounds like our Local AI system walkthrough could really help. It's a quick 20-minute chat with one of our specialists — they'll break down exactly how businesses like yours are using Local AI for automations, client generation, or internal efficiency.\n\nWould you be open to booking a quick session this week?",
    on_yes_next_node: "BOOKING_STAGE_TEXT",
    on_no_next_node: "OBJECTION_HANDLING_STAGE_TEXT",
    crm_actions: "Present offer via text. Track response.",
    workflow_name: "Website Signup Workflow",
    display_order: 15
  },

  // OBJECTION HANDLING STAGE - TEXT
  {
    node_id: "OBJECTION_HANDLING_STAGE_TEXT",
    parent_id: "OFFER_STAGE_TEXT",
    stage: "Objection",
    scenario_title: "Handle Objections (Text)",
    scenario_description: "Address concerns via text before returning to offer",
    script_name: "Website Signup Script",
    script_section: "Text Path - Objections",
    script_content: "No worries! Is there anything specific you'd want to know more about before scheduling?\n\n(wait for response)\n\nOr if timing's the issue, when would work better for you?",
    on_yes_next_node: "OFFER_STAGE_TEXT",
    crm_actions: "Log objection via text. Tag: Text Objection Handled. Return to offer.",
    workflow_name: "Website Signup Workflow",
    display_order: 16
  },

  // BOOKING STAGE - TEXT
  {
    node_id: "BOOKING_STAGE_TEXT",
    parent_id: "OFFER_STAGE_TEXT",
    stage: "Close",
    scenario_title: "Book Appointment (Text)",
    scenario_description: "Schedule consultation via text message",
    script_name: "Website Signup Script",
    script_section: "Text Path - Booking",
    script_content: "Awesome. What time zone are you in?\n(wait for reply)\n\nCool — would tomorrow morning or afternoon work better?\n(wait)\n\nIf unavailable: No worries, I can find another slot later in the week.\n\nConfirm:\nPerfect, I'll set you up with {CloserName} for {AppointmentDate}. They'll walk you through everything and give you some tactical recommendations for your setup.",
    on_yes_next_node: "FINAL_CLOSE_STAGE_TEXT",
    crm_actions: "Send SMS confirmation link\nUpdate CRM: Qualified – Booked Call\nNotify Closer\nCreate calendar event",
    workflow_name: "Website Signup Workflow",
    display_order: 17
  },

  // FINAL CLOSE STAGE - TEXT
  {
    node_id: "FINAL_CLOSE_STAGE_TEXT",
    parent_id: "BOOKING_STAGE_TEXT",
    stage: "Outcome",
    scenario_title: "Confirmation (Text)",
    scenario_description: "Send final confirmation and pre-call materials via text",
    script_name: "Website Signup Script",
    script_section: "Text Path - Final Close",
    script_content: "You're all set! You'll get a confirmation text with the meeting link shortly.\n\nI'm also sending over a quick video about our Local AI systems — it'll help you get even more out of the call.\n\nSee you on {AppointmentDate}!",
    crm_actions: "Automation: Send confirmation SMS and email\nSend pre-call video link\nTag: Booked via Text\nNotify team",
    workflow_name: "Website Signup Workflow",
    display_order: 18
  },

  // FOLLOW UP DECLINE - TEXT
  {
    node_id: "FOLLOW_UP_DECLINE_TEXT",
    parent_id: "INTRO_STAGE_TEXT",
    stage: "Outcome",
    scenario_title: "Not Interested (Text)",
    scenario_description: "Lead declined - mark as warm lead for future follow-up",
    script_name: "Website Signup Script",
    script_section: "Text Path - Decline",
    script_content: "All good — if anything changes down the track, we're always happy to chat or show you what's new in Local AI tech.",
    crm_actions: "Tag CRM: Not Interested – Warm Lead\nSchedule 90-day follow-up nurture sequence\nLog decline reason if provided",
    workflow_name: "Website Signup Workflow",
    display_order: 19
  }
];
