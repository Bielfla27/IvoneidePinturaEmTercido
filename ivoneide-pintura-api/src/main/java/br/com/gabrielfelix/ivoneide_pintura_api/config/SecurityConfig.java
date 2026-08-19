package br.com.gabrielfelix.ivoneide_pintura_api.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import br.com.gabrielfelix.ivoneide_pintura_api.security.JwtAuthenticationFilter;
import br.com.gabrielfelix.ivoneide_pintura_api.security.RestAccessDeniedHandler;
import br.com.gabrielfelix.ivoneide_pintura_api.security.RestAuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
	private final RestAccessDeniedHandler restAccessDeniedHandler;

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
			RestAuthenticationEntryPoint restAuthenticationEntryPoint,
			RestAccessDeniedHandler restAccessDeniedHandler) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
		this.restAuthenticationEntryPoint = restAuthenticationEntryPoint;
		this.restAccessDeniedHandler = restAccessDeniedHandler;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(exception -> exception
						.authenticationEntryPoint(restAuthenticationEntryPoint)
						.accessDeniedHandler(restAccessDeniedHandler))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/produtos/ativos", "/api/produtos/*").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/usuarios/me").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/pedidos/meus", "/api/pedidos/*").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/pedidos/*/recibo", "/api/pedidos/*/downloads").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/compras/meu-historico").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/pedidos").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/produtos").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/produtos/*").hasRole("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/produtos/*").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/produtos").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/usuarios", "/api/usuarios/*").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/pedidos").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PATCH, "/api/pedidos/*/status").hasRole("ADMIN")
						.anyRequest().authenticated())
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
				.build();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
			throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
