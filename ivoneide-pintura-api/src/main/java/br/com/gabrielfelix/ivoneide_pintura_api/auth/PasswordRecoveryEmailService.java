package br.com.gabrielfelix.ivoneide_pintura_api.auth;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PasswordRecoveryEmailService {

	private final Optional<JavaMailSender> mailSender;
	private final Environment environment;
	private final String fromEmail;

	public PasswordRecoveryEmailService(Optional<JavaMailSender> mailSender, Environment environment,
			@Value("${app.mail.from}") String fromEmail) {
		this.mailSender = mailSender;
		this.environment = environment;
		this.fromEmail = fromEmail;
	}

	public boolean sendRecoveryCode(String toEmail, String code) {
		if (mailSender.isEmpty() || environment.getProperty("spring.mail.host") == null) {
			System.out.println("Codigo de recuperacao para " + toEmail + ": " + code);
			return false;
		}

		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(fromEmail);
		message.setTo(toEmail);
		message.setSubject("Codigo de recuperacao de senha");
		message.setText("Seu codigo de recuperacao e: " + code
				+ "\n\nEle expira em 15 minutos. Se voce nao pediu isso, ignore este e-mail.");

		try {
			mailSender.get().send(message);
			return true;
		} catch (MailException exception) {
			System.out.println("Nao foi possivel enviar e-mail de recuperacao. Codigo para "
					+ toEmail + ": " + code);
			return false;
		}
	}
}
