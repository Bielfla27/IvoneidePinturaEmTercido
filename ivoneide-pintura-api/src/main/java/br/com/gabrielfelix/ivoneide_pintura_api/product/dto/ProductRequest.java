package br.com.gabrielfelix.ivoneide_pintura_api.product.dto;

import java.math.BigDecimal;

import br.com.gabrielfelix.ivoneide_pintura_api.product.ProductType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ProductRequest {

	@NotBlank(message = "O nome do produto é obrigatório.")
	@Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
	private String nome;

	@NotBlank(message = "A descrição do produto é obrigatória.")
	@Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres.")
	private String descricao;

	@NotNull(message = "O preço do produto é obrigatório.")
	@DecimalMin(value = "0.01", message = "O preço deve ser maior que zero.")
	private BigDecimal preco;

	@NotNull(message = "O tipo do produto é obrigatório.")
	private ProductType tipo;

	@NotBlank(message = "O link do PDF é obrigatório.")
	@Size(max = 500, message = "O link do PDF deve ter no máximo 500 caracteres.")
	private String urlPdf;

	@Size(max = 500, message = "O link da imagem deve ter no máximo 500 caracteres.")
	private String urlImagemCapa;

	private Boolean ativo = true;

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
}
