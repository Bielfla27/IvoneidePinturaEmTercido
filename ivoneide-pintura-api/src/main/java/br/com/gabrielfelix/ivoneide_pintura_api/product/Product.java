package br.com.gabrielfelix.ivoneide_pintura_api.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "produtos")
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 120)
	private String nome;

	@Column(nullable = false, length = 1000)
	private String descricao;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal preco;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private ProductType tipo;

	@Column(nullable = false, length = 500)
	private String urlPdf;

	@Column(length = 500)
	private String urlImagemCapa;

	@Column(nullable = false)
	private Boolean ativo;

	@Column(nullable = false, updatable = false)
	private LocalDateTime criadoEm;

	@Column(nullable = false)
	private LocalDateTime atualizadoEm;

	public Product() {
	}

	public Product(String nome, String descricao, BigDecimal preco, ProductType tipo, String urlPdf,
			String urlImagemCapa, Boolean ativo) {
		this.nome = nome;
		this.descricao = descricao;
		this.preco = preco;
		this.tipo = tipo;
		this.urlPdf = urlPdf;
		this.urlImagemCapa = urlImagemCapa;
		this.ativo = ativo;
	}

	@PrePersist
	public void beforeCreate() {
		LocalDateTime agora = LocalDateTime.now();
		this.criadoEm = agora;
		this.atualizadoEm = agora;
	}

	@PreUpdate
	public void beforeUpdate() {
		this.atualizadoEm = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public BigDecimal getPreco() {
		return preco;
	}

	public void setPreco(BigDecimal preco) {
		this.preco = preco;
	}

	public ProductType getTipo() {
		return tipo;
	}

	public void setTipo(ProductType tipo) {
		this.tipo = tipo;
	}

	public String getUrlPdf() {
		return urlPdf;
	}

	public void setUrlPdf(String urlPdf) {
		this.urlPdf = urlPdf;
	}

	public String getUrlImagemCapa() {
		return urlImagemCapa;
	}

	public void setUrlImagemCapa(String urlImagemCapa) {
		this.urlImagemCapa = urlImagemCapa;
	}

	public Boolean getAtivo() {
		return ativo;
	}

	public void setAtivo(Boolean ativo) {
		this.ativo = ativo;
	}

	public LocalDateTime getCriadoEm() {
		return criadoEm;
	}

	public LocalDateTime getAtualizadoEm() {
		return atualizadoEm;
	}
}
