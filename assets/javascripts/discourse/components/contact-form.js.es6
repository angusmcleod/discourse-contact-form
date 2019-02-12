import { default as computed, on } from 'ember-addons/ember-computed-decorators';
import InputValidation from 'discourse/models/input-validation';
import { emailValid } from 'discourse/lib/utilities';
import { ajax } from 'discourse/lib/ajax';

export default Ember.Component.extend({
  formSubmitted: false,
  classNames: 'contact-form',
  name: '',
  email: '',
  submitted: false,
  validation: {failed: true},
  showMessage: Discourse.SiteSettings.contact_form_include_message,
  showName: Discourse.SiteSettings.contact_form_include_name,

  didInsertElement() {
    Ember.run.scheduleOnce('afterRender', () => {
      $('section.about.contact').hide();
      $('section.contact-form-container').appendTo('.contents.body-page');
    });
  },

  @computed('nameValidation', 'emailValidation', 'messageValidation', 'formSubmitted')
  submitDisabled() {
    if (this.get('formSubmitted')) return true;

    if (this.get('showName')) {
      if (this.get('nameValidation.failed')) return true;
    }

    if (this.get('emailValidation.failed')) return true;

    if (this.get('showMessage')) {
      if (this.get('messageValidation.failed')) return true;
    }

    return false;
  },

  @computed('email')
  emailValidation(email) {
    if (Ember.isEmpty(email)) {
      return InputValidation.create({
        failed: true
      });
    }

    if (emailValid(email)) {
      return InputValidation.create({
        ok: true,
        reason: I18n.t('user.email.ok')
      });
    }

    return InputValidation.create({
      failed: true,
      reason: I18n.t('user.email.invalid')
    });
  },

  @computed('emailValidation')
  emailValidationError(validation) {
    return validation && validation.failed && validation.reason ? validation.reason : null;
  },

  @computed('name')
  nameValidation() {
    return this.textValidation('name');
  },

  @computed('message')
  messageValidation() {
    return this.textValidation('message');
  },

  textValidation(property) {
    if (Ember.isEmpty(this.get(property))) {
      return InputValidation.create({failed: true});
    }

    return InputValidation.create({ok: true});
  },

  actions: {
    submitContact() {
      if (this.get('submitDisabled')) return false;

      let data = this.getProperties('email');

      if (this.get('showName')) {
        data['name'] = this.get('name');
      }

      if (this.get('showMessage')) {
        data['message'] = this.get('message');
      }

      let self = this;
      this.setProperties({
        'formSubmitted': true,
        'submitting': true
      });

      ajax('/contact/send', {
        data,
        type: 'POST'
      }).then(() => {
        this.set('submitting', false);
        if (data.error) {
          self.set('contactResult', I18n.t('contact_form.failed'));
          return self.set('formSubmitted', false);
        }
        self.set('contactResult', I18n.t('contact_form.succeded'));
      });

      return false;
    }
  }
});
