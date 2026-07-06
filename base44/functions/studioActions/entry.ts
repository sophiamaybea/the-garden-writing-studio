import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;
    const isEIC = user.role === 'admin';
    const members = await svc.entities.EditorialMember.filter({ email: user.email });
    const member = members.find((m) => m.status !== 'revoked') || null;
    const editorialRole = isEIC ? 'editor_in_chief' : (member ? member.editorial_role : null);
    const allowed = isEIC || !!member;

    const body = await req.json();
    const action = body.action;

    if (action === 'access') {
      if (allowed && member && member.status === 'invited') {
        await svc.entities.EditorialMember.update(member.id, { status: 'active', name: member.name || user.full_name });
      }
      return Response.json({ allowed, role: editorialRole });
    }

    if (!allowed) return Response.json({ error: 'The Studio is private by design.' }, { status: 403 });

    if (action === 'invite') {
      if (!isEIC) return Response.json({ error: 'Only the Editor-in-Chief can invite editors.' }, { status: 403 });
      const email = (body.email || '').trim().toLowerCase();
      if (!email) return Response.json({ error: 'An email is required.' }, { status: 400 });
      const existing = await svc.entities.EditorialMember.filter({ email });
      if (existing.some((m) => m.status !== 'revoked')) {
        return Response.json({ error: 'This person has already been invited.' }, { status: 400 });
      }
      const rec = await svc.entities.EditorialMember.create({
        name: body.name || '',
        email,
        editorial_role: body.editorial_role || 'editor',
        status: 'invited',
        invited_by: user.full_name,
      });
      let inviteSent = true;
      try {
        await base44.users.inviteUser(email, 'user');
      } catch (e) {
        inviteSent = false; // account may already exist — membership record still grants Studio access
      }
      return Response.json({ member: rec, invite_sent: inviteSent });
    }

    if (action === 'revoke') {
      if (!isEIC) return Response.json({ error: 'Only the Editor-in-Chief can revoke access.' }, { status: 403 });
      await svc.entities.EditorialMember.update(body.member_id, { status: 'revoked' });
      return Response.json({ ok: true });
    }

    if (action === 'decide') {
      const sub = await svc.entities.GallerySubmission.get(body.submission_id);
      if (!sub) return Response.json({ error: 'Submission not found.' }, { status: 404 });
      const update = { status: body.status };
      if (body.editor_note !== undefined) update.editor_note = body.editor_note;
      await svc.entities.GallerySubmission.update(sub.id, update);
      const fee = Number(body.fee) || 0;
      if (body.status === 'accepted' && fee > 0) {
        await svc.entities.Earning.create({
          writer_id: sub.author_id,
          source_type: 'publication',
          description: `Gallery publication — "${sub.piece_title || 'Untitled'}"`,
          amount: fee,
          currency: 'GBP',
          status: 'pending',
        });
      }
      return Response.json({ ok: true });
    }

    if (action === 'approve_payment') {
      if (!isEIC && editorialRole !== 'senior_editor') {
        return Response.json({ error: 'Payments require a senior editor.' }, { status: 403 });
      }
      await svc.entities.Earning.update(body.earning_id, { status: 'available' });
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});